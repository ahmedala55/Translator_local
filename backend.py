"""Authenticated Argos service for a separately hosted translation engine."""
import os
import secrets
import threading

from fastapi import FastAPI, Header, HTTPException
from pydantic import BaseModel, Field
import engine

app = FastAPI(docs_url=None, redoc_url=None)
lock = threading.Lock()


class TranslationRequest(BaseModel):
    text: str = Field(min_length=1, max_length=5000)
    source: str = 'en'
    target: str = 'ar'


@app.get('/health')
def health():
    return {'status': 'ok'}


@app.post('/translate')
def translate(body: TranslationRequest, authorization: str = Header(default='')):
    token = os.environ.get('ARGOS_API_KEY')
    if not token:
        raise HTTPException(503, 'Translation service is not configured')
    if not secrets.compare_digest(authorization, f'Bearer {token}'):
        raise HTTPException(401, 'Unauthorized')
    if body.source != 'en' or body.target != 'ar' or not body.text.strip():
        raise HTTPException(400, 'Only English to Arabic is supported')
    with lock:
        return {'translation': engine.translate(body.text.strip())}
