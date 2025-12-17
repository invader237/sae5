import time
import os
import json
import base64
import hashlib
import jwt
from cryptography.fernet import Fernet
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

# Clé de chiffrement dérivée du secret pour chiffrer le payload JWT
_ENCRYPTION_KEY = base64.urlsafe_b64encode(
    hashlib.sha256(JWT_SECRET.encode()).digest()
)
_fernet = Fernet(_ENCRYPTION_KEY)


def hash_password(p: str) -> str:
    return pwd.hash(p)


def verify_password(p: str, hashed: str) -> bool:
    return pwd.verify(p, hashed)


def _encrypt_payload(payload: dict) -> str:
    """Chiffre le payload JSON avec Fernet (AES-128-CBC)."""
    json_bytes = json.dumps(payload).encode("utf-8")
    return _fernet.encrypt(json_bytes).decode("utf-8")


def _decrypt_payload(encrypted: str) -> dict:
    """Déchiffre le payload Fernet et retourne le dict."""
    try:
        decrypted = _fernet.decrypt(encrypted.encode("utf-8"))
        return json.loads(decrypted.decode("utf-8"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or corrupted token payload",
        )


def create_access_token(user_id: str, role: str = None) -> str:
    """
    Crée un JWT avec le payload chiffré.

    Le payload sensible (user_id, role) est chiffré avec Fernet,
    puis embarqué dans un JWT signé. Ainsi, même si le JWT est
    décodé via jwt.io, le contenu reste illisible sans la clé.
    """
    now = int(time.time())
    sensitive_payload = {
        "user_id": user_id,
        "role": role,
    }
    encrypted_data = _encrypt_payload(sensitive_payload)

    jwt_payload = {
        "data": encrypted_data,
        "iat": now,
        "exp": now + JWT_EXPIRE_SEC,
    }
    return jwt.encode(jwt_payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(token: str) -> dict:
    """
    Décode et vérifie le JWT, puis déchiffre le payload.

    Returns:
        dict: Payload déchiffré contenant user_id, role, etc.
    """
    try:
        jwt_payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    encrypted_data = jwt_payload.get("data")
    if not encrypted_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token structure",
        )

    return _decrypt_payload(encrypted_data)
