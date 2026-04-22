from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request, HTTPException
from datetime import datetime, timedelta
from typing import Dict
import bleach
import re

import os
from dotenv import load_dotenv

import redis

load_dotenv()
REDIS_URL = os.getenv("REDIS_URL", "memory://")

if REDIS_URL.startswith("redis"):
    try:
        r = redis.Redis.from_url(REDIS_URL, socket_connect_timeout=1)
        r.ping()
    except Exception as e:
        print(f"Redis unavailable for rate limiter, falling back to memory: {e}")
        REDIS_URL = "memory://"

# Rate limiter with Redis backend support for horizontal scaling
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=REDIS_URL
)

# Login attempt tracker
login_attempts: Dict[str, list] = {}
MAX_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

def check_login_attempts(identifier: str):
    now = datetime.utcnow()
    cutoff = now - timedelta(minutes=LOCKOUT_MINUTES)
    
    if identifier not in login_attempts:
        login_attempts[identifier] = []
    
    # Clean old attempts
    login_attempts[identifier] = [
        t for t in login_attempts[identifier] if t > cutoff
    ]
    
    if len(login_attempts[identifier]) >= MAX_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail=f"Account locked. Too many failed attempts. Try again in {LOCKOUT_MINUTES} minutes."
        )

def record_failed_attempt(identifier: str):
    if identifier not in login_attempts:
        login_attempts[identifier] = []
    login_attempts[identifier].append(datetime.utcnow())

def clear_attempts(identifier: str):
    if identifier in login_attempts:
        login_attempts[identifier] = []

def sanitize_input(text: str) -> str:
    if not text:
        return text
    # Remove HTML tags and dangerous content
    clean = bleach.clean(text, tags=[], strip=True)
    # Remove null bytes
    clean = clean.replace('\x00', '')
    # Limit length
    return clean[:10000]

def validate_username(username: str) -> bool:
    return bool(re.match(r'^[a-zA-Z0-9_]{3,30}$', username))

def validate_password_strength(password: str) -> tuple[bool, str]:
    if len(password) < 8:
        return False, "Password must be at least 8 characters"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    return True, "OK"

# Security headers middleware
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response