import json
import os
import urllib.request
import psycopg2

ADMIN_EMAIL = 'ni8888kita@yandex.ru'
MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions'

SYSTEM_PROMPT = (
    "Ты — Сварог, AI-менеджер студии разработки ПО Svarog.Tech. "
    "Ты анализируешь описание программы клиента, определяешь нужные технологии, "
    "домены, хостинг, базы данных и привлекаемых специалистов (тестировщики, дизайнеры). "
    "Ты ведёшь переговоры о стоимости разработки в рублях, обосновываешь цену, "
    "отвечаешь дружелюбно и профессионально. Если клиент согласен на оплату — "
    "поздравь и сообщи, что заказ передан администратору Никите для подтверждения. "
    "Отвечай кратко, на русском языке."
)


def call_mistral(messages: list) -> str:
    api_key = os.environ.get('MISTRAL_API_KEY')
    if not api_key:
        return "AI Сварог временно недоступен — администратор ещё не подключил ключ. Опишите задачу, и Никита свяжется с вами."
    payload = json.dumps({
        'model': 'mistral-small-latest',
        'messages': messages,
        'temperature': 0.6,
    }).encode()
    req = urllib.request.Request(MISTRAL_URL, data=payload, headers={
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    })
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read())
            return data['choices'][0]['message']['content']
    except Exception as e:
        return f"Не удалось связаться с AI: {str(e)[:120]}"


def user_from_token(token: str):
    if not token or '.' not in token:
        return None
    try:
        return int(token.split('.')[0])
    except ValueError:
        return None


def handler(event: dict, context) -> dict:
    '''Заказы и чат со Сварогом: создание заказа, AI-анализ, переговоры о стоимости.'''
    method = event.get('httpMethod', 'GET')
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
    }
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    headers = event.get('headers') or {}
    token = headers.get('X-Auth-Token') or headers.get('x-auth-token') or ''
    uid = user_from_token(token)
    if not uid:
        return {'statusCode': 401, 'headers': cors, 'body': json.dumps({'error': 'Не авторизован'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    out = {}
    code = 200

    if method == 'GET':
        cur.execute(
            "SELECT id, title, description, ai_analysis, estimated_price, status, payment_confirmed, created_at "
            "FROM orders WHERE user_id = %s ORDER BY created_at DESC", (uid,))
        orders = [{
            'id': r[0], 'title': r[1], 'description': r[2], 'ai_analysis': r[3],
            'estimated_price': r[4], 'status': r[5], 'payment_confirmed': r[6],
            'created_at': str(r[7]),
        } for r in cur.fetchall()]
        out = {'orders': orders}
    else:
        body = json.loads(event.get('body') or '{}')
        action = body.get('action')

        if action == 'create':
            title = (body.get('title') or 'Новый проект').strip()
            desc = (body.get('description') or '').strip()
            if not desc:
                cur.close(); conn.close()
                return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Опишите программу'})}
            analysis = call_mistral([
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': f"Проанализируй мой проект и предложи примерную стоимость разработки. Описание: {desc}"},
            ])
            cur.execute(
                "INSERT INTO orders (user_id, title, description, ai_analysis, status) "
                "VALUES (%s, %s, %s, %s, 'analyzed') RETURNING id",
                (uid, title, desc, analysis))
            order_id = cur.fetchone()[0]
            cur.execute("INSERT INTO messages (order_id, role, content) VALUES (%s, 'assistant', %s)", (order_id, analysis))
            conn.commit()
            out = {'order_id': order_id, 'analysis': analysis}

        elif action == 'message':
            order_id = body.get('order_id')
            text = (body.get('text') or '').strip()
            cur.execute("SELECT description FROM orders WHERE id = %s AND user_id = %s", (order_id, uid))
            row = cur.fetchone()
            if not row:
                cur.close(); conn.close()
                return {'statusCode': 404, 'headers': cors, 'body': json.dumps({'error': 'Заказ не найден'})}
            cur.execute("INSERT INTO messages (order_id, role, content) VALUES (%s, 'user', %s)", (order_id, text))
            cur.execute("SELECT role, content FROM messages WHERE order_id = %s ORDER BY created_at", (order_id,))
            history = [{'role': r[0], 'content': r[1]} for r in cur.fetchall()]
            reply = call_mistral([
                {'role': 'system', 'content': SYSTEM_PROMPT + f" Контекст проекта: {row[0]}"},
                *history,
            ])
            cur.execute("INSERT INTO messages (order_id, role, content) VALUES (%s, 'assistant', %s)", (order_id, reply))
            conn.commit()
            out = {'reply': reply}

        elif action == 'messages':
            order_id = body.get('order_id')
            cur.execute("SELECT role, content, created_at FROM messages WHERE order_id = %s ORDER BY created_at", (order_id,))
            out = {'messages': [{'role': r[0], 'content': r[1], 'created_at': str(r[2])} for r in cur.fetchall()]}

        elif action == 'agree':
            order_id = body.get('order_id')
            cur.execute("UPDATE orders SET payment_confirmed = TRUE, status = 'awaiting_admin' WHERE id = %s AND user_id = %s", (order_id, uid))
            cur.execute("INSERT INTO messages (order_id, role, content) VALUES (%s, 'user', %s)", (order_id, 'Я согласен на оплату разработки.'))
            conn.commit()
            out = {'ok': True}
        else:
            code = 400; out = {'error': 'Неизвестное действие'}

    cur.close()
    conn.close()
    return {'statusCode': code, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps(out, ensure_ascii=False)}
