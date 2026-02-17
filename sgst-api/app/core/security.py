from datetime import datetime, timedelta, timezone
from app.core.config import settings
from app.core.exceptions import ConfigError, TokenExpiradoException, TokenInvalidoException
from jwt import ExpiredSignatureError, PyJWTError
from app.models.usuarios import UsuarioDTO
import jwt

SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = settings.JWT_ALGORITHM

def crear_token(usuario: UsuarioDTO) -> str:
    if not SECRET_KEY:
        raise ConfigError()
    if len(SECRET_KEY) < settings.JWT_SECRET_KEY_MIN_LENGTH:
        raise ConfigError()

    exp = datetime.now(timezone.utc) + timedelta(minutes=10)

    payload = {
        "id_usuario": usuario.id_usuario,
        "id_empresa": usuario.id_empresa,
        "exp": int(exp.timestamp())
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    
    return token

def decodificar_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )
        return payload

    except ExpiredSignatureError:
        raise TokenExpiradoException()

    except PyJWTError:
        raise TokenInvalidoException()
