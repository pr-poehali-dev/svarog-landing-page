import json
import os
import hashlib
import hmac
import secrets
import psycopg2

ADMIN_EMAIL = 'ni8888kita@yandex.ru'


def hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()


def make_token(user_id: int, email: str) -> str:
    secret = os.environ.get('DATABASE_URL', 'fallback')[:32]
    raw = f"{user_id}:{email}"
    sig = hmac.new(secret.encode(), raw.encode(), hashlib.sha256).hexdigest()[:32]
    return f"{user_id}.{sig}"


def handler(event: dict, context) -> dict:
    '''Регистрация и вход пользователей Svarog.Tech без подтверждения email.'''
    method = event.get('httpMethod', 'GET')
    cors = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
        'Access-Control-Max-Age': '86400',
    }
    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': cors, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    action = body.get('action')
    name = (body.get('name') or '').strip()
    email = (body.get('email') or '').strip().lower()
    password = body.get('password') or ''

    if not email or not password:
        return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Заполните email и пароль'})}

    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    result = {}
    code = 200

    if action == 'register':
        if not name:
            cur.close(); conn.close()
            return {'statusCode': 400, 'headers': cors, 'body': json.dumps({'error': 'Укажите имя'})}
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            code = 409; result = {'error': 'Пользователь с таким email уже есть'}
        else:
            salt = secrets.token_hex(8)
            pwd = f"{salt}${hash_password(password, salt)}"
            is_admin = email == ADMIN_EMAIL
            cur.execute(
                "INSERT INTO users (name, email, password_hash, is_admin) VALUES (%s, %s, %s, %s) RETURNING id",
                (name, email, pwd, is_admin),
            )
            uid = cur.fetchone()[0]
            conn.commit()
            result = {'token': make_token(uid, email), 'user': {'id': uid, 'name': name, 'email': email, 'is_admin': is_admin}}

    elif action == 'login':
        cur.execute("SELECT id, name, password_hash, is_admin FROM users WHERE email = %s", (email,))
        row = cur.fetchone()
        if not row:
            code = 401; result = {'error': 'Неверный email или пароль'}
        else:
            uid, uname, pwd, is_admin = row
            salt = pwd.split('$')[0]
            if pwd == f"{salt}${hash_password(password, salt)}":
                result = {'token': make_token(uid, email), 'user': {'id': uid, 'name': uname, 'email': email, 'is_admin': is_admin}}
            else:
                code = 401; result = {'error': 'Неверный email или пароль'}
    else:
        code = 400; result = {'error': 'Неизвестное действие'}

    cur.close()
    conn.close()
    return {'statusCode': code, 'headers': {**cors, 'Content-Type': 'application/json'}, 'body': json.dumps(result)}
