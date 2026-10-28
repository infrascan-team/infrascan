from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import verify_password, create_access_token, get_password_hash
from app.models.user import User
from app.schemas.auth import LoginRequest, Token, UserResponse, UserCreate
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
