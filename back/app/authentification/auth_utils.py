import time, jwt
from fastapi import HTTPException, status
from passlib.context import CryptContext
from app.config import settings

pwd = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto",
)

JWT_SECRET = getattr(settings, "JWT_SECRET", "dev_secret")
JWT_ALG = getattr(settings, "JWT_ALG", "HS256")
JWT_EXPIRE_SEC = int(getattr(settings, "JWT_EXPIRE_SEC", 3600))

def hash_password(p: str) -> str:
    return pwd.hash(p)

def verify_password(p: str, hashed: str) -> bool:
    return pwd.verify(p, hashed)

def create_access_token(sub: str) -> str:
    now = int(time.time())
    payload = {"sub": sub, "iat": now, "exp": now + JWT_EXPIRE_SEC}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
