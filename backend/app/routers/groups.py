from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List
from app.database import async_session_maker
from app.models import Group, Book
from app.schemas import GroupSchema

router = APIRouter(tags=["groups"])

async def get_db():
    async with async_session_maker() as session:
        yield session

@router.get("/groups", response_model=List[GroupSchema])
async def get_groups(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Group)
        .options(
            selectinload(Group.books)
            .selectinload(Book.genres)
        )
    )
    groups = result.scalars().all()
    return groups

@router.post("/groups", response_model=GroupSchema)
async def create_group(title: str, description: str = None, db: AsyncSession = Depends(get_db)):
    group = Group(title=title, description=description)
    db.add(group)
    await db.commit()
    await db.refresh(group)
    return group

@router.post("/groups/{group_id}/books/{book_id}", response_model=GroupSchema)
async def add_book_to_group(group_id: int, book_id: int, db: AsyncSession = Depends(get_db)):
    group = await db.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Группа не найдена")
    book = await db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")
    if book not in group.books:
        group.books.append(book)
        await db.commit()
        await db.refresh(group)
    return group
