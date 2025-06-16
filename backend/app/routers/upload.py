from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth import get_current_user, get_db
from pathlib import Path
import shutil
import uuid
import os
from passlib.context import CryptContext
from passlib.hash import bcrypt
from app.schemas import UserUpdateSchema
from app.models import User
from sqlalchemy.orm import selectinload
from sqlalchemy import select
from jose import jwt

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/upload-photo")
async def upload_photo(
    photo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    uploads_dir = BASE_DIR / "uploads"
    uploads_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}_{photo.filename}"
    file_location = uploads_dir / filename

    with open(str(file_location), "wb") as buffer:
        shutil.copyfileobj(photo.file, buffer)

    user.photo = f"/uploads/{filename}"
    db.add(user)
    await db.commit()
    await db.refresh(user)

    photo_url = f"http://localhost:8000{user.photo}"
    return JSONResponse(content={"photo": photo_url})

@router.delete("/delete-photo")
async def delete_photo(
    db: AsyncSession = Depends(get_db),
    user=Depends(get_current_user),
):
    if not user.photo:
        raise HTTPException(status_code=404, detail="Аватарка не найдена")

    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    file_path = BASE_DIR / user.photo.lstrip("/")
    if file_path.exists():
        os.remove(file_path)

    user.photo = ""
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return JSONResponse(content={"detail": "Аватарка удалена", "photo": ""})

@router.put("/update-profile")
async def update_profile(
    update_data: UserUpdateSchema,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    updated = False
    email_changed = False

    if update_data.username and update_data.username != user.username:
        user.username = update_data.username
        updated = True

    if update_data.email and update_data.email != user.email:
        user.email = update_data.email
        updated = True
        email_changed = True

    if update_data.biography is not None and update_data.biography != user.biography:
        user.biography = update_data.biography
        updated = True

    # Добавляем обновление поля name
    if update_data.name is not None and update_data.name != user.name:
        user.name = update_data.name
        updated = True

    if update_data.old_password and update_data.new_password:
        if not bcrypt.verify(update_data.old_password, user.password):
            raise HTTPException(status_code=400, detail="Старый пароль неверен")
        user.password = pwd_context.hash(update_data.new_password)
        updated = True

    if updated:
        db.add(user)
        await db.commit()
        await db.refresh(user)

    # Загрузить пользователя с ролью через selectinload
    result = await db.execute(
        select(User).options(selectinload(User.role)).where(User.id == user.id)
    )
    user_with_role = result.scalar_one()

    role_name = getattr(user_with_role.role, "name", None) if user_with_role.role else None

    new_token = None
    if email_changed:
        new_token = jwt.encode({"sub": user_with_role.email, "role": role_name}, SECRET_KEY, algorithm=ALGORITHM)

    response_data = {
        "id": user_with_role.id,
        "username": user_with_role.username,
        "email": user_with_role.email,
        "id_role": user_with_role.id_role,
        "role": role_name,
        "photo": user_with_role.photo,
        "biography": user_with_role.biography or "",
        "name": user_with_role.name or "",
    }
    if new_token:
        response_data["access_token"] = new_token

    return response_data

