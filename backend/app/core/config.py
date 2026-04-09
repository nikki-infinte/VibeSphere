from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Smart Event Discovery API"
    secret_key: str = "dev-secret-key"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 120
    database_url: str = "sqlite:///./smart_events.db"
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "mistral"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


settings = Settings()
