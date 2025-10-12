"""FastAPI dependencies."""
from typing import Optional
from fastapi import Depends, HTTPException, status, Header, WebSocket
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from sqlalchemy.orm import Session

from app.config import get_settings
from app.db.session import get_db
from app.db.models import User, Org, Member

settings = get_settings()
security = HTTPBearer(auto_error=False)  # Don't auto-error if no token in demo mode


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user (or demo user if demo_mode enabled)."""
    # Demo mode: return anonymous demo user
    if settings.demo_mode and (credentials is None or not credentials.credentials):
        # Get or create demo user
        demo_user = db.query(User).filter(User.email == "demo@power-platform.local").first()
        if not demo_user:
            demo_user = User(
                email="demo@power-platform.local",
                name="Demo User",
                provider="demo"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        return demo_user

    # Normal authentication flow
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    return user


def get_current_org(
    x_org_id: Optional[str] = Header(None),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Org:
    """Get current organization from header (or demo org in demo mode)."""
    # Demo mode: return default demo org
    if settings.demo_mode and user.email == "demo@power-platform.local":
        demo_org = db.query(Org).filter(Org.name == "Demo Organization").first()
        if not demo_org:
            demo_org = Org(name="Demo Organization", meta={})
            db.add(demo_org)
            db.commit()
            db.refresh(demo_org)

            # Add demo user as member
            member = Member(
                user_id=user.id,
                org_id=demo_org.id,
                role="admin"
            )
            db.add(member)
            db.commit()
        return demo_org

    if not x_org_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="X-Org-Id header required"
        )

    try:
        org_id = int(x_org_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid org ID"
        )

    # Check membership
    member = db.query(Member).filter(
        Member.user_id == user.id,
        Member.org_id == org_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization"
        )

    org = db.query(Org).filter(Org.id == org_id).first()
    if not org:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Organization not found"
        )

    return org


def require_role(*allowed_roles: str):
    """Require specific user role."""
    def role_checker(
        user: User = Depends(get_current_user),
        org: Org = Depends(get_current_org),
        db: Session = Depends(get_db)
    ):
        member = db.query(Member).filter(
            Member.user_id == user.id,
            Member.org_id == org.id
        ).first()

        if not member or member.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return user

    return role_checker


async def get_current_user_ws(
    websocket: WebSocket,
    token: Optional[str] = None,
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current authenticated user for WebSocket connections."""
    if not token:
        return None

    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email: str = payload.get("sub")
        if email is None:
            return None
    except JWTError:
        return None

    user = db.query(User).filter(User.email == email).first()
    return user
