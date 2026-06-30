import json
import os
import urllib.request
import psycopg2

ADMIN_EMAIL = 'ni8888kita@yandex.ru'
MISTRAL_URL = 'https://api.mistral.ai/v1/chat/completions'


def call_mistral(messages: list) -> str:
    api_key = os.environ.get('MISTRAL_API_KEY')
    if not api_key:
        return "Ключ Mistral не подключён."
    payload = json.dumps({'model': 'mistral-small-latest', 'messages': messages, 'temperature': 0.4}).encode()
    req = urllib.request.Request(MISTRAL_URL, data=payload, headers={
        'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            return json.loads(resp.read())['choices'][0]['message']['content']
    except Exception as e:
        return f"Ошибка генерации: {str(e)[:120]}"


def is_admin(cur, token: str) -> bool:
    if not token or '.' not in token:
        return False
    try:
        uid = int(token.split('.')[0])
    except ValueError:
        return False
    cur.execute("SELECT is_admin FROM users WHERE id = %s", (uid,))
    row = cur.fetchone()
    return bool(row and row[0])


def handler(event: dict, context) -> dict:
    '''Панель администратора Никиты: все заказы, подтверждение оплаты, одобрение, промт для IDE.'''
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

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()

    if not is_admin(cur, token):
        cur.close(); conn.close()
        return {'statusCode': 403, 'headers': cors, 'body': json.dumps({'error': 'Доступ только для администратора'})}

    out = {}
    code = 200

    if method == 'GET':
        cur.execute(
            "SELECT o.id, o.title, o.description, o.ai_analysis, o.estimated_price, o.status, "
            "o.payment_confirmed, o.created_at, u.name, u.email "
            "FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.payment_confirmed DESC, o.created_at DESC")
        out = {'orders': [{
            'id': r[0], 'title': r[1], 'description': r[2], 'ai_analysis': r[3],
            'estimated_price': r[4], 'status': r[5], 'payment_confirmed': r[6],
            'created_at': str(r[7]), 'user_name': r[8], 'user_email': r[9],
        } for r in cur.fetchall()]}
    else:
        body = json.loads(event.get('body') or '{}')
        action = body.get('action')
        order_id = body.get('order_id')

        if action == 'approve':
            cur.execute("UPDATE orders SET status = 'approved' WHERE id = %s", (order_id,))
            conn.commit(); out = {'ok': True}
        elif action == 'reject':
            cur.execute("UPDATE orders SET status = 'rejected' WHERE id = %s", (order_id,))
            conn.commit(); out = {'ok': True}
        elif action == 'messages':
            cur.execute(
                "SELECT role, content, created_at FROM messages WHERE order_id = %s ORDER BY created_at",
                (order_id,))
            out = {'messages': [{'role': r[0], 'content': r[1], 'created_at': str(r[2])} for r in cur.fetchall()]}
        elif action == 'send':
            text = (body.get('text') or '').strip()
            if not text:
                code = 400; out = {'error': 'Пустое сообщение'}
            else:
                cur.execute(
                    "INSERT INTO messages (order_id, role, content) VALUES (%s, 'operator', %s)",
                    (order_id, text))
                conn.commit(); out = {'ok': True}
        elif action == 'prompt':
            cur.execute("SELECT title, description, ai_analysis FROM orders WHERE id = %s", (order_id,))
            r = cur.fetchone()
            if not r:
                code = 404; out = {'error': 'Заказ не найден'}
            else:
                prompt = call_mistral([
                    {'role': 'system', 'content': 'Ты — техлид. На основе заказа составь чёткий промт для IDE/AI-разработчика: стек, структура, ключевые экраны и функции. Кратко, по-русски, готово к копированию.'},
                    {'role': 'user', 'content': f"Название: {r[0]}\nОписание: {r[1]}\nАнализ: {r[2]}"},
                ])
                out = {'prompt': prompt}
        else:
            code = 400; out = {'error': 'Неизвестное действие'}

    cur.close()
    conn.close()
    return {'statusCode': code, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps(out, ensure_ascii=False)}