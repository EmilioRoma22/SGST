from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer
from app.auth.jwt_handler import decodificar_token
import jwt

auth_scheme = HTTPBearer()

def verify_token(request: Request):
    access_token = request.cookies.get("access_token")

    if not access_token:
        raise HTTPException(status_code=401, detail="No autenticado")

    try:
        payload = decodificar_token(access_token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")

    return payload

def obtener_payload(request: Request):
    access_token = request.cookies.get("access_token")
    if not access_token:
        raise HTTPException(status_code=401, detail="No autenticado")

    try:
        return decodificar_token(access_token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
