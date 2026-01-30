"""
Compatibility shim: re-export DTOs from `app.auth.domain.DTO`.

This file is kept for backward compatibility; prefer importing
from `app.auth.domain.DTO.<name>` directly.
"""

from app.auth.domain.DTO.user_create import UserCreate
from app.auth.domain.DTO.user_login import UserLogin
from app.auth.domain.DTO.user_out import UserOut
from app.auth.domain.DTO.token import TokenOut
from app.auth.domain.DTO.password_update import PasswordUpdate

__all__ = [
    "UserCreate",
    "UserLogin",
    "UserOut",
    "TokenOut",
    "PasswordUpdate",
]
