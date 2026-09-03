from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    
    SECRET_KEY: str
    
    DEBUG: bool = False
    
    MODEL_PATH: str
    
    MODEL_NAME: str
    
    MEMOIZATION_FLAG: bool
    
    DATABASE_URL: str
    
    model_config = SettingsConfigDict(
        env_file= BASE_DIR / '.env',
        extra='ignore'
    )


settings = Settings()   # type: ignore