import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: int = int(os.getenv("DB_PORT", "5432"))
    DB_NAME: str = os.environ["DB_NAME"]
    DB_USER: str = os.environ["DB_USER"]
    DB_PASSWORD: str = os.environ["DB_PASSWORD"]

    @property
    def DATABASE_URL(self) -> str:
        from urllib.parse import quote

        user = quote(self.DB_USER, safe="")
        password = quote(self.DB_PASSWORD, safe="")
        return (
            f"postgresql://{user}:{password}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

settings = Settings()
