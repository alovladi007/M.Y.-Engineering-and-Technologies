"""
Organization management API routes.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Org, Member, User
from app.deps import get_current_user, get_current_org
from pydantic import BaseModel

router = APIRouter(prefix="/orgs", tags=["organizations"])


class OrgCreate(BaseModel):
    name: str
    description: str | None = None


class OrgResponse(BaseModel):
    id: int
    name: str
    description: str | None = None

    class Config:
        from_attributes = True


class MemberResponse(BaseModel):
    user_id: int
    org_id: int
    role: str
    user_email: str
    user_name: str

    class Config:
        from_attributes = True


class MemberInvite(BaseModel):
    email: str
    role: str = "viewer"


@router.post("/", response_model=OrgResponse, status_code=status.HTTP_201_CREATED)
async def create_org(
    org_data: OrgCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Create a new organization."""
    org = Org(name=org_data.name, description=org_data.description)
    db.add(org)
    db.flush()

    # Add creator as admin
    member = Member(user_id=current_user.id, org_id=org.id, role="admin")
    db.add(member)
    db.commit()
    db.refresh(org)

    return org


@router.get("/", response_model=List[OrgResponse])
async def list_orgs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List organizations user is a member of."""
    memberships = db.query(Member).filter(Member.user_id == current_user.id).all()
    org_ids = [m.org_id for m in memberships]
    orgs = db.query(Org).filter(Org.id.in_(org_ids)).all()
    return orgs


@router.get("/{org_id}", response_model=OrgResponse)
async def get_org(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get organization details."""
    # Check membership
    member = db.query(Member).filter(
        Member.user_id == current_user.id,
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


@router.get("/{org_id}/members", response_model=List[MemberResponse])
async def list_members(
    org_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List organization members."""
    # Check membership
    member = db.query(Member).filter(
        Member.user_id == current_user.id,
        Member.org_id == org_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a member of this organization"
        )

    members = db.query(Member).filter(Member.org_id == org_id).all()
    result = []
    for m in members:
        user = db.query(User).filter(User.id == m.user_id).first()
        result.append({
            "user_id": m.user_id,
            "org_id": m.org_id,
            "role": m.role,
            "user_email": user.email if user else "",
            "user_name": user.name if user else "",
        })

    return result


@router.post("/{org_id}/members", status_code=status.HTTP_201_CREATED)
async def invite_member(
    org_id: int,
    invite: MemberInvite,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Invite a member to organization (admin only)."""
    # Check admin membership
    member = db.query(Member).filter(
        Member.user_id == current_user.id,
        Member.org_id == org_id,
        Member.role == "admin"
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    # Find user by email
    user = db.query(User).filter(User.email == invite.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Check if already a member
    existing = db.query(Member).filter(
        Member.user_id == user.id,
        Member.org_id == org_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member"
        )

    # Add member
    new_member = Member(user_id=user.id, org_id=org_id, role=invite.role)
    db.add(new_member)
    db.commit()

    return {"message": "Member invited successfully"}


@router.delete("/{org_id}/members/{user_id}")
async def remove_member(
    org_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove member from organization (admin only)."""
    # Check admin membership
    admin = db.query(Member).filter(
        Member.user_id == current_user.id,
        Member.org_id == org_id,
        Member.role == "admin"
    ).first()

    if not admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    # Don't allow removing yourself
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove yourself"
        )

    member = db.query(Member).filter(
        Member.user_id == user_id,
        Member.org_id == org_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found"
        )

    db.delete(member)
    db.commit()

    return {"message": "Member removed successfully"}
