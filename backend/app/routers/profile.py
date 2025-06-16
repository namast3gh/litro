# backend/app/routers/profile.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import async_session_maker
from app.models import User, PurchaseHistory
from app.schemas import UserSchema, PurchaseHistorySchema
from app.auth import get_current_user
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/profile", tags=["profile"])

async def get_db():
    async with async_session_maker() as session:
        yield session

@router.get("/", response_model=UserSchema)
async def get_profile(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user

@router.get("/purchase-history", response_model=List[PurchaseHistorySchema])
async def get_purchase_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PurchaseHistory)
        .options(selectinload(PurchaseHistory.book).selectinload(Book.genres))
        .where(PurchaseHistory.user_id == current_user.id)
        .order_by(PurchaseHistory.purchase_date.desc())
    )
    
    return result.scalars().all()
