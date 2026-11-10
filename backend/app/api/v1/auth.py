from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.user import User
from app.schemas.auth import LoginRequest, Token, UserResponse, UserCreate, UserUpdate
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=Token)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate civil engineering personnel and return access token.
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    
    # In development/demo, if user doesn't exist yet, auto-create
    if not user:
        user = User(
            id=f"USR-{login_data.email.split('@')[0].upper()[:6]}",
            email=login_data.email,
            name=login_data.email.split('@')[0].replace('.', ' ').title(),
            hashed_password=get_password_hash(login_data.password),
            role=login_data.role or "Civil Engineer",
            department="Civil Infrastructure Division",
            avatar=login_data.email[:2].upper(),
            status="Active"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Verify password
        if not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect email or security password",
            )
        # Update simulated role if specified
        if login_data.role and user.role != login_data.role:
            user.role = login_data.role
            db.commit()
            db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Fetch the currently logged in user profile.
    """
    if not current_user:
        # Return default first user in demo mode
        user = db.query(User).first()
        if user:
            return user
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user

@router.get("/users", response_model=List[UserResponse])
def get_users(
    role: Optional[str] = Query(None, description="Filter by user role"),
    status: Optional[str] = Query(None, description="Filter by status (Active/Inactive)"),
    db: Session = Depends(get_db)
):
    """
    List all registered engineering and operations personnel.
    """
    query = db.query(User)
    if role and role != "All":
        query = query.filter(User.role == role)
    if status and status != "All":
        query = query.filter(User.status == status)
    return query.order_by(User.name.asc()).all()

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Invite / register a new user into the platform.
    """
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")

    user_id = f"USR-{user_in.email.split('@')[0].upper()[:6]}"
    # Ensure ID uniqueness
    if db.query(User).filter(User.id == user_id).first():
        user_id = f"USR-{db.query(User).count() + 101}"

    user = User(
        id=user_id,
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password or "CivilSafe2024!"),
        role=user_in.role or "Civil Engineer",
        department=user_in.department or "Civil Infrastructure Division",
        avatar=user_in.avatar or user_in.name[:2].upper(),
        status=user_in.status or "Active",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: str, updates: UserUpdate, db: Session = Depends(get_db)):
    """
    Update user profile, assigned role, department, or active status.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = updates.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        user.hashed_password = get_password_hash(update_data.pop("password"))

    for field, value in update_data.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user

@router.delete("/users/{user_id}")
def delete_user(user_id: str, db: Session = Depends(get_db)):
    """
    Remove user from access register.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": f"User {user_id} deleted successfully", "id": user_id}
