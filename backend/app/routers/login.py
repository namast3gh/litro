from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from passlib.hash import bcrypt
from jose import jwt
from app.database import async_session_maker
from app.models import User
from app.schemas import UserLoginSchema

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

router = APIRouter(prefix="/auth", tags=["auth"])

async def get_db():
    async with async_session_maker() as session:
        yield session

@router.post("/login")
async def login(user_data: UserLoginSchema = Body(...), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User).options(selectinload(User.role)).where(User.email == user_data.email)
    )
    user = result.scalar_one_or_none()
    if not user or not bcrypt.verify(user_data.password, user.password):
        raise HTTPException(status_code=401, detail="Неверный логин или пароль")

    token = jwt.encode({"sub": user.email, "role": user.role.name}, SECRET_KEY, algorithm=ALGORITHM)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role.name,
            "photo": user.photo,
            "id_role": user.id_role,
            "biography": user.biography or "",
            "name": user.name or "",
        }
    }
