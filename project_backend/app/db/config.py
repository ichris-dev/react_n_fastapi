from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    
    DATABASE_URL: str
    
    model_config = SettingsConfigDict(
        env_file= BASE_DIR / '.env',
        extra='ignore'
    )


settings = Settings()   # type: ignore