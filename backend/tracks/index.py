"""
Управление треками K.J: загрузка аудио в S3, получение каталога.
"""
import json
import os
import base64
import uuid
import psycopg2
import boto3

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_s3():
    return boto3.client(
        "s3",
        endpoint_url="https://bucket.poehali.dev",
        aws_access_key_id=os.environ["AWS_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["AWS_SECRET_ACCESS_KEY"],
    )


def ok(data):
    return {"statusCode": 200, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps(data, ensure_ascii=False)}


def err(code, msg):
    return {"statusCode": code, "headers": {**CORS, "Content-Type": "application/json"}, "body": json.dumps({"error": msg}, ensure_ascii=False)}


def get_user_from_session(cur, session_id):
    if not session_id:
        return None
    cur.execute(
        "SELECT u.id, u.name, u.email FROM users u JOIN sessions s ON s.user_id = u.id WHERE s.id = %s",
        (session_id,)
    )
    row = cur.fetchone()
    if not row:
        return None
    return {"id": row[0], "name": row[1], "email": row[2]}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    headers = event.get("headers") or {}
    session_id = headers.get("x-session-id") or headers.get("X-Session-Id")
    params = event.get("queryStringParameters") or {}

    conn = get_conn()
    cur = conn.cursor()

    try:
        # GET / — каталог треков
        if method == "GET":
            limit = int(params.get("limit", 50))
            offset = int(params.get("offset", 0))
            cur.execute(
                """SELECT t.id, t.title, t.artist, t.duration_sec, t.file_url, t.cover_url, t.plays, t.created_at,
                          u.name as uploader
                   FROM tracks t JOIN users u ON u.id = t.user_id
                   ORDER BY t.created_at DESC LIMIT %s OFFSET %s""",
                (limit, offset)
            )
            rows = cur.fetchall()
            tracks = [
                {
                    "id": r[0], "title": r[1], "artist": r[2],
                    "duration_sec": r[3], "file_url": r[4], "cover_url": r[5],
                    "plays": r[6], "created_at": str(r[7]), "uploader": r[8]
                }
                for r in rows
            ]
            return ok({"tracks": tracks, "total": len(tracks)})

        # POST / — загрузка трека
        if method == "POST":
            user = get_user_from_session(cur, session_id)
            if not user:
                return err(401, "Необходимо войти в аккаунт")

            body = json.loads(event.get("body") or "{}")
            title = (body.get("title") or "").strip()
            artist = (body.get("artist") or "").strip()
            file_b64 = body.get("file_b64") or ""
            file_name = body.get("file_name") or "track.mp3"
            cover_b64 = body.get("cover_b64") or ""
            cover_name = body.get("cover_name") or ""
            duration_sec = body.get("duration_sec")

            if not title or not artist or not file_b64:
                return err(400, "title, artist и file_b64 обязательны")

            s3 = get_s3()
            key_id = os.environ["AWS_ACCESS_KEY_ID"]

            # Загрузка аудио
            audio_data = base64.b64decode(file_b64)
            ext = file_name.rsplit(".", 1)[-1].lower() if "." in file_name else "mp3"
            audio_key = f"tracks/{uuid.uuid4()}.{ext}"
            s3.put_object(Bucket="files", Key=audio_key, Body=audio_data, ContentType=f"audio/{ext}")
            file_url = f"https://cdn.poehali.dev/projects/{key_id}/bucket/{audio_key}"

            # Загрузка обложки (если есть)
            cover_url = None
            if cover_b64 and cover_name:
                cover_data = base64.b64decode(cover_b64)
                cext = cover_name.rsplit(".", 1)[-1].lower() if "." in cover_name else "jpg"
                cover_key = f"covers/{uuid.uuid4()}.{cext}"
                s3.put_object(Bucket="files", Key=cover_key, Body=cover_data, ContentType=f"image/{cext}")
                cover_url = f"https://cdn.poehali.dev/projects/{key_id}/bucket/{cover_key}"

            cur.execute(
                "INSERT INTO tracks (user_id, title, artist, duration_sec, file_url, cover_url) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
                (user["id"], title, artist, duration_sec, file_url, cover_url)
            )
            track_id = cur.fetchone()[0]
            conn.commit()
            return ok({"id": track_id, "file_url": file_url, "cover_url": cover_url})

        return err(404, "Not found")

    finally:
        cur.close()
        conn.close()
