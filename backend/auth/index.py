"""
Авторизация пользователей K.J: регистрация, вход, получение профиля, выход.
Принимает POST с полем action: register | login | logout | me.
"""
import json
import os
import hashlib
import secrets
import psycopg2

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def ok(data: dict) -> dict:
    return {"statusCode": 200, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False)}


def err(code: int, message: str) -> dict:
    return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": message}, ensure_ascii=False)}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    headers = event.get("headers") or {}
    session_id = headers.get("x-session-id") or headers.get("X-Session-Id")

    conn = get_conn()
    cur = conn.cursor()

    try:
        body = {}
        if method == "POST":
            body = json.loads(event.get("body") or "{}")

        action = body.get("action") if method == "POST" else "me"

        # Регистрация
        if action == "register":
            name = (body.get("name") or "").strip()
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""

            if not email or not password:
                return err(400, "Email и пароль обязательны")

            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                return err(409, "Пользователь с таким email уже существует")

            pw_hash = hash_password(password)
            cur.execute(
                "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
                (name or None, email, pw_hash)
            )
            user_id = cur.fetchone()[0]
            sid = secrets.token_hex(32)
            cur.execute("INSERT INTO sessions (id, user_id) VALUES (%s, %s)", (sid, user_id))
            conn.commit()
            return ok({"sessionId": sid, "user": {"id": user_id, "name": name, "email": email}})

        # Вход
        if action == "login":
            email = (body.get("email") or "").strip().lower()
            password = body.get("password") or ""

            if not email or not password:
                return err(400, "Email и пароль обязательны")

            pw_hash = hash_password(password)
            cur.execute(
                "SELECT id, name, email FROM users WHERE email = %s AND password_hash = %s",
                (email, pw_hash)
            )
            row = cur.fetchone()
            if not row:
                return err(401, "Неверный email или пароль")

            user_id, name, user_email = row
            sid = secrets.token_hex(32)
            cur.execute("INSERT INTO sessions (id, user_id) VALUES (%s, %s)", (sid, user_id))
            conn.commit()
            return ok({"sessionId": sid, "user": {"id": user_id, "name": name, "email": user_email}})

        # Профиль
        if action == "me":
            if not session_id:
                return err(401, "Нет сессии")
            cur.execute(
                "SELECT u.id, u.name, u.email FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.id = %s",
                (session_id,)
            )
            row = cur.fetchone()
            if not row:
                return err(401, "Сессия недействительна")
            user_id, name, email = row
            return ok({"user": {"id": user_id, "name": name, "email": email}})

        # Выход
        if action == "logout":
            if session_id:
                cur.execute("UPDATE sessions SET user_id = user_id WHERE id = %s", (session_id,))
                conn.commit()
            return ok({"ok": True})

        return err(400, "Неизвестное действие")

    finally:
        cur.close()
        conn.close()