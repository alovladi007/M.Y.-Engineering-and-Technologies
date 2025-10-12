"""Authentication routes - OAuth and JWT."""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2AuthorizationCodeBearer
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import jwt
import httpx

from app.config import get_settings
from app.db.session import get_db
from app.db.models import User
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()

oauth2_scheme = OAuth2AuthorizationCodeBearer(
    authorizationUrl="https://accounts.google.com/o/oauth2/auth",
    tokenUrl="https://oauth2.googleapis.com/token"
)


class TokenResponse(BaseModel):
    """Token response."""
    access_token: str
    token_type: str
    user: dict


class UserResponse(BaseModel):
    """User response."""
    id: int
    email: str
    name: str
    role: str


@router.get("/oauth/google")
async def google_oauth_login():
    """Initiate Google OAuth flow."""
    auth_url = (
        f"https://accounts.google.com/o/oauth2/auth?"
        f"client_id={settings.google_client_id}&"
        f"redirect_uri={settings.oauth_redirect_uri}&"
        f"response_type=code&"
        f"scope=openid email profile"
    )
    return {"auth_url": auth_url}


@router.get("/oauth/github")
async def github_oauth_login():
    """Initiate GitHub OAuth flow."""
    auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={settings.github_client_id}&"
        f"redirect_uri={settings.oauth_redirect_uri}&"
        f"scope=read:user user:email"
    )
    return {"auth_url": auth_url}


@router.post("/oauth/callback")
async def oauth_callback(
    code: str,
    provider: str,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """
    Handle OAuth callback and create/login user.

    Args:
        code: OAuth authorization code
        provider: OAuth provider (google, github)
        db: Database session

    Returns:
        JWT access token
    """
    # Exchange code for token
    if provider == "google":
        user_info = await _get_google_user_info(code)
    elif provider == "github":
        user_info = await _get_github_user_info(code)
    else:
        raise HTTPException(status_code=400, detail="Invalid provider")

    # Create or get user
    user = db.query(User).filter(User.email == user_info["email"]).first()

    if not user:
        user = User(
            email=user_info["email"],
            name=user_info.get("name", ""),
            provider=provider
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Create JWT token
    token = _create_access_token({"sub": user.email})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role.value
        }
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> UserResponse:
    """Get current user information."""
    # Decode token
    try:
        payload = jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.algorithm]
        )
        email = payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role.value
    )


async def _get_google_user_info(code: str) -> dict:
    """Exchange Google auth code for user info."""
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uri": settings.oauth_redirect_uri,
                "grant_type": "authorization_code"
            }
        )
        token_data = token_response.json()
        access_token = token_data.get("access_token")

        # Get user info
        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        return user_response.json()


async def _get_github_user_info(code: str) -> dict:
    """Exchange GitHub auth code for user info."""
    async with httpx.AsyncClient() as client:
        # Exchange code for token
        token_response = await client.post(
            "https://github.com/login/oauth/access_token",
            data={
                "code": code,
                "client_id": settings.github_client_id,
                "client_secret": settings.github_client_secret,
                "redirect_uri": settings.oauth_redirect_uri
            },
            headers={"Accept": "application/json"}
        )
        token_data = token_response.json()
        access_token = token_data.get("access_token")

        # Get user info
        user_response = await client.get(
            "https://api.github.com/user",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_data = user_response.json()

        # Get email
        email_response = await client.get(
            "https://api.github.com/user/emails",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        emails = email_response.json()
        primary_email = next((e["email"] for e in emails if e["primary"]), emails[0]["email"])

        return {
            "email": primary_email,
            "name": user_data.get("name", user_data.get("login"))
        }


def _create_access_token(data: dict) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.secret_key,
        algorithm=settings.algorithm
    )
    return encoded_jwt
