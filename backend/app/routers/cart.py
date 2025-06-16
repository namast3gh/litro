from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import insert, delete, and_
from datetime import datetime
from typing import List

from app.auth import get_current_user
from app.models import Cart, CartItem, Book, PurchaseHistory, User, Rating, Comment
from app.schemas import BookSchema, PurchaseHistorySchema
from app.database import async_session_maker

router = APIRouter(tags=["cart"])

async def get_db():
    async with async_session_maker() as session:
        yield session

@router.get("/cart", response_model=List[BookSchema])
async def get_cart(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cart).where(Cart.id_user == current_user.id))
    cart = result.scalar_one_or_none()
    if not cart:
        return []

    items_result = await db.execute(
        select(Book)
        .join(CartItem, CartItem.id_book == Book.id)
        .options(selectinload(Book.genres))
        .where(CartItem.id_cart == cart.id)
    )
    books = items_result.scalars().all()

    books_schema = [BookSchema.model_validate(book) for book in books]  # Pydantic v2

    return books_schema

@router.post("/cart/add/{book_id}", status_code=201)
async def add_to_cart(book_id: int, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cart).where(Cart.id_user == current_user.id))
    cart = result.scalar_one_or_none()
    if not cart:
        cart = Cart(id_user=current_user.id)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)

    item_result = await db.execute(
        select(CartItem).where(CartItem.id_cart == cart.id, CartItem.id_book == book_id)
    )
    item = item_result.scalar_one_or_none()
    if item:
        raise HTTPException(status_code=400, detail="Книга уже в корзине")

    new_item = CartItem(id_cart=cart.id, id_book=book_id, quantity=1)
    db.add(new_item)
    await db.commit()
    return {"detail": "Книга добавлена в корзину"}

@router.delete("/cart/remove/{book_id}")
async def remove_from_cart(book_id: int, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cart).where(Cart.id_user == current_user.id))
    cart = result.scalar_one_or_none()
    if not cart:
        raise HTTPException(status_code=404, detail="Корзина не найдена")

    await db.execute(
        delete(CartItem).where(CartItem.id_cart == cart.id, CartItem.id_book == book_id)
    )
    await db.commit()
    return {"detail": "Книга удалена из корзины"}

@router.post("/cart/checkout")
async def checkout_cart(
    book_ids: List[int] = Body(..., embed=True),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Получаем корзину с элементами
    result = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items))
        .where(Cart.id_user == current_user.id)
    )
    cart = result.scalar_one_or_none()

    if not cart or not cart.items:
        raise HTTPException(status_code=400, detail="Корзина пуста")

    # Фильтруем только выбранные книги, которые есть в корзине
    selected_items = [item for item in cart.items if item.id_book in book_ids]

    if not selected_items:
        raise HTTPException(status_code=400, detail="Выбранные книги не найдены в корзине")

    purchase_data = [
        {
            "user_id": current_user.id,
            "book_id": item.id_book,
            "quantity": item.quantity,
            "purchase_date": datetime.utcnow()
        }
        for item in selected_items
    ]

    await db.execute(insert(PurchaseHistory).values(purchase_data))
    # Удаляем только выбранные книги из корзины
    await db.execute(
        delete(CartItem).where(
            CartItem.id_cart == cart.id,
            CartItem.id_book.in_(book_ids)
        )
    )
    await db.commit()

    return {"detail": "Покупка оформлена"}


@router.get("/profile/purchase-history", response_model=List[PurchaseHistorySchema])
async def get_purchase_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PurchaseHistory)
        .options(
            selectinload(PurchaseHistory.book).selectinload(Book.genres)
        )
        .where(PurchaseHistory.user_id == current_user.id)
        .order_by(PurchaseHistory.purchase_date.desc())
    )
    purchases = result.scalars().all()

    # Загрузим рейтинги и отзывы пользователя для этих книг
    book_ids = [p.book_id for p in purchases]
    ratings_result = await db.execute(
        select(Rating).where(
            and_(Rating.id_user == current_user.id, Rating.id_book.in_(book_ids))
        )
    )
    ratings = {r.id_book: r for r in ratings_result.scalars().all()}

    comments_result = await db.execute(
        select(Comment).where(
            and_(Comment.id_user == current_user.id, Comment.id_book.in_(book_ids))
        )
    )
    comments = {c.id_book: c for c in comments_result.scalars().all()}

    # Привяжем к каждой покупке рейтинг и комментарий
    for purchase in purchases:
        purchase.user_rating = ratings.get(purchase.book_id)
        purchase.user_comment = comments.get(purchase.book_id)

    return purchases
