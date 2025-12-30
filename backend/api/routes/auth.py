"""
Authentication endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from models.user import UserCreate, UserLogin, TokenResponse, UserResponse
from db.supabase import supabase_client, supabase_admin_client
from db.repositories import UserRepository
from api.dependencies import get_user_repository, get_current_user
from core.config import settings
from loguru import logger

router = APIRouter()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    user_repo: UserRepository = Depends(get_user_repository)
):
    """
    Register a new user
    """
    try:
        # Create user in Supabase Auth
        response = supabase_client.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "email_redirect_to": None,
                "data": {
                    "full_name": user_data.full_name
                }
            }
        })
        
        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user"
            )
        
        # Create user profile using admin client to bypass RLS
        try:
            supabase_admin_client.table("user_profiles").insert({
                "id": str(response.user.id),
                "email": user_data.email,
                "full_name": user_data.full_name
            }).execute()
            logger.info(f"User profile created for: {user_data.email}")
        except Exception as profile_error:
            logger.error(f"Failed to create user profile: {profile_error}")
            # If profile creation fails, we need to fix RLS policies
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User created but profile setup failed. Please run fix_rls_policies.sql in Supabase SQL Editor."
            )
        
        logger.info(f"User registered: {user_data.email}")
        
        # Check if session exists (it won't if email confirmation is required)
        if response.session:
            return TokenResponse(
                access_token=response.session.access_token,
                token_type="bearer",
                expires_in=response.session.expires_in,
                user=UserResponse(
                    id=response.user.id,
                    email=response.user.email,
                    full_name=user_data.full_name,
                    created_at=response.user.created_at
                )
            )
        else:
            # Email confirmation required
            raise HTTPException(
                status_code=status.HTTP_201_CREATED,
                detail={
                    "message": "Registration successful. Please check your email to confirm your account.",
                    "user_id": str(response.user.id),
                    "email": response.user.email,
                    "confirmation_required": True
                }
            )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login", response_model=TokenResponse)
async def login(user_data: UserLogin):
    """
    Login user
    """
    try:
        response = supabase_client.auth.sign_in_with_password({
            "email": user_data.email,
            "password": user_data.password
        })
        
        if not response.user or not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        logger.info(f"User logged in: {user_data.email}")
        
        return TokenResponse(
            access_token=response.session.access_token,
            token_type="bearer",
            expires_in=response.session.expires_in,
            user=UserResponse(
                id=response.user.id,
                email=response.user.email,
                created_at=response.user.created_at
            )
        )
    
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )


@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout user
    """
    try:
        supabase_client.auth.sign_out()
        logger.info(f"User logged out: {current_user['email']}")
        return {"message": "Successfully logged out"}
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current user information
    """
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        created_at=current_user["user"].created_at
    )
