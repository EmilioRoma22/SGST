import os
from typing import List
from dotenv import load_dotenv

load_dotenv()

ALGORITMOS_JWT_PERMITIDOS = frozenset({"HS256", "HS384", "HS512", "RS256", "RS384", "RS512"})

def _obtener_algoritmo_jwt() -> str:
    valor = os.getenv("ALGORITMO") or "HS256"
    if valor not in ALGORITMOS_JWT_PERMITIDOS:
        return "HS256"
    return valor

class Settings:
    PROJECT_NAME: str = "Sistema de Gestión de Servicios Técnicos"
    API_V1_PREFIX: str = "/api/v1"

    CORS_ORIGINS: List[str] = [
        origin
        for origin in [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            os.getenv("IP_FRONTEND_NETWORK"),
        ]
        if origin
    ]

    JWT_SECRET_KEY: str = os.getenv("SECRET_KEY")
    JWT_ALGORITHM: str = _obtener_algoritmo_jwt()
    JWT_SECRET_KEY_MIN_LENGTH: int = 32

    COOKIES_SECURE: bool = os.getenv("COOKIES_SECURE", "false").lower() in ("true", "1", "yes")

settings = Settings()