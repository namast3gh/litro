from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from datetime import date
from app.database import async_session_maker
from app.models import Comment, User, Book, PurchaseHistory
from app.schemas import CommentSchema, CommentCreateSchema
from app.routers.dependencies import RoleChecker
from app.auth import get_current_user
from typing import List
from sqlalchemy.orm import selectinload

router = APIRouter(prefix="/comments", tags=["comments"])
BASE_URL = "http://87.228.102.111:8000"

async def get_db():
    async with async_session_maker() as session:
        yield session

allowed_roles = ["admin", "user", "author"]
role_checker = RoleChecker(allowed_roles)

@router.post("/", response_model=CommentSchema)
async def create_comment(
    comment_in: CommentCreateSchema,
    current_user: User = Depends(role_checker),
    db: AsyncSession = Depends(get_db),
):
    # Проверяем, что книга существует
    book = await db.get(Book, comment_in.id_book)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")

    # Проверяем, что пользователь купил книгу
    purchase = await db.execute(
        select(PurchaseHistory).where(
            PurchaseHistory.user_id == current_user.id,
            PurchaseHistory.book_id == comment_in.id_book
        )
    )
    if not purchase.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Можно комментировать только купленные книги")

    comment = Comment(
        text=comment_in.text,
        date=date.today(),
        id_user=current_user.id,
        id_book=comment_in.id_book,
    )
    db.add(comment)
    await db.commit()
    await db.refresh(comment)

    comment.user_name = current_user.username

    return comment

@router.get("/book/{book_id}", response_model=List[CommentSchema])
async def get_comments_for_book(book_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.user))
        .where(Comment.id_book == book_id)
        .order_by(Comment.date.desc())
    )
    comments = result.scalars().all()

    for comment in comments:
        comment.user_name = comment.user.username if comment.user else None
        if comment.user and comment.user.photo:
            if comment.user.photo.startswith("http"):
                comment.user_photo = comment.user.photo
            else:
                comment.user_photo = BASE_URL + comment.user.photo
        else:
            comment.user_photo = None  # Явно указываем None, чтобы не было пропущенного поля

    return comments

@router.delete("/{comment_id}", status_code=204)
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    comment = await db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Комментарий не найден")

    # Проверяем, что текущий пользователь — автор комментария или админ
    if comment.id_user != current_user.id and current_user.id_role != 1:
        raise HTTPException(status_code=403, detail="Нет прав на удаление комментария")

    await db.delete(comment)
    await db.commit()
    return
