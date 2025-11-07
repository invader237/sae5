from pydantic_settings import BaseSettings
from urllib.parse import quote_plus


class Settings(BaseSettings):
    APP_PROFILE: str = "dev-dtrivino"
    DB_USER: str = "sae5"
    DB_PASSWORD: str = "93biUy4H5QXHh8D27pcv"
    DB_HOST: str = "51.91.10.125"
    DB_PORT: int = 5432

    @property
    def database_url(self):
        password_encoded = quote_plus(self.DB_PASSWORD)
        return (
            f"postgresql+psycopg2://{self.DB_USER}:{password_encoded}@"
            f"{self.DB_HOST}:{self.DB_PORT}/{self.APP_PROFILE}"
            "?client_encoding=utf8"
        )

    class Config:
        env_file = "D:/it/BUT3/sae5/back/.env"
        env_file_encoding = "utf-8"


settings = Settings()
