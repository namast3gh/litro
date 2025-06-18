from fastapi import APIRouter, HTTPException, Depends, Body
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker
from app.models import User, Role
from app.schemas import UserCreateSchema, UserSchema
from passlib.hash import bcrypt
from sqlalchemy import select
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/auth", tags=["auth"])

async def get_db():
    async with async_session_maker() as session:
        yield session

@router.post("/register", response_model=UserSchema)
async def register(user_data: UserCreateSchema = Body(...), db: AsyncSession = Depends(get_db)):
    existing_user = await db.execute(
        select(User).where(User.email == user_data.email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

    role = await db.get(Role, user_data.id_role)
    if not role:
        raise HTTPException(status_code=400, detail="Роль не найдена")

    hashed_password = bcrypt.hash(user_data.password)

    user = User(
        username=user_data.username,
        email=user_data.email,
        password=hashed_password,
        id_role=role.id,
        name=user_data.name,
        biography=user_data.biography,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Загрузим пользователя с ролью, чтобы сериализация работала корректно
    result = await db.execute(
        select(User).options(selectinload(User.role)).where(User.id == user.id)
    )
    user_with_role = result.scalar_one()

    return user_with_role
