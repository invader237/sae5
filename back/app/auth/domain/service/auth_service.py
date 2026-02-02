from datetime import timedelta

from app.auth.infra.jwt.jwt_service import create_access_token
from app.auth.infra.password.password_hasher import verify_password
from app.auth.infra.jwt.jwt_config import ACCESS_TOKEN_EXPIRE_MINUTES


class AuthService:

    def __init__(self, user_catalog):
        self.user_catalog = user_catalog

    def authenticate(self, email: str, password: str) -> str:
        user = self.user_catalog.find_by_email(email)

        if not user or not verify_password(password, user.password):
            raise ValueError("Invalid credentials")

        token = create_access_token(
            data={
                "sub": str(user.user_id),
                "role": user.role.type
            },
            expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        return token
