from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from app.core.config import settings
from app.core.rate_limit import limiter
from app.routes import auth, empresas, suscripciones, talleres
from app.core.exceptions import AppException


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    return JSONResponse(
        status_code=429,
        content={
            "error": {
                "code": "RATE_LIMIT_EXCEDIDO",
                "message": "Demasiados intentos. Espere un momento e intente de nuevo.",
            }
        },
    )

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="API para el sistema SGST (Sistema de Gestión de Servicios Técnicos)"
    )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    configure_cors(app)
    include_routers(app)
    return app

def configure_cors(app: FastAPI) -> None:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

def include_routers(app: FastAPI) -> None:
    app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
    app.include_router(empresas.router, prefix=settings.API_V1_PREFIX)
    app.include_router(suscripciones.router, prefix=settings.API_V1_PREFIX)
    app.include_router(talleres.router, prefix=settings.API_V1_PREFIX)

app = create_app()

@app.exception_handler(AppException)
async def app_exception_handler(
    request: Request,
    exc: AppException
):
    response = JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.code,
                "message": exc.message,
            }
        }
    )

    if request.url.path.endswith(("/auth/refresh", "/auth/cerrar_sesion")):
        cookie_params = {
            "path": "/",
            "httponly": True,
            "secure": settings.COOKIES_SECURE,
            "samesite": "lax",
        }
        response.delete_cookie("access_token", **cookie_params)
        response.delete_cookie("refresh_token", **cookie_params)
        if request.url.path.endswith("/auth/cerrar_sesion"):
            response.delete_cookie("id_taller_actual", **cookie_params)

    return response