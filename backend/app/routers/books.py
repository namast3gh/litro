from fastapi import APIRouter, Depends, HTTPException, Body, UploadFile, File, Form, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, delete
from sqlalchemy.orm import selectinload
from app.database import async_session_maker
from app.models import Book, Rating, User, Author, Genre, Comment, Group, PurchaseHistory
from app.schemas import (
    BookSchema, RatingCreateSchema, AuthorSchema, GenreSchema,
    CommentSchema, UserSchema, PaginatedBooksSchema,
    AuthorInfoSchema, UserAuthorInfoSchema, GenreCreateSchema
)
from app.auth import get_current_user
from app.routers.dependencies import RoleChecker
from typing import List, Optional
from datetime import datetime
from pathlib import Path
import shutil
import uuid
import logging
from typing import List
from pathlib import Path as SysPath
from fastapi.responses import FileResponse


router = APIRouter(tags=["data"])

async def get_db():
    async with async_session_maker() as session:
        yield session

author_role_checker = RoleChecker(["author", "автор"])

@router.get("/authors", response_model=List[AuthorSchema])
async def get_authors(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Author))
    return result.scalars().all()

@router.get("/genres", response_model=List[GenreSchema])
async def get_genres(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Genre))
    return result.scalars().all()

@router.get("/users", response_model=List[UserSchema])
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    return result.scalars().all()

@router.get("/comments", response_model=List[CommentSchema])
async def get_comments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Comment))
    return result.scalars().all()

@router.get("/books", response_model=List[BookSchema])
async def get_books(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Book)
        .options(
            selectinload(Book.genres),
            selectinload(Book.author),
            selectinload(Book.uploader),
        )
    )
    books = result.scalars().all()

    for book in books:
        avg = await db.execute(
            select(func.avg(Rating.rating)).where(Rating.id_book == book.id)
        )
        average = avg.scalar()
        book.average_rating = round(float(average), 2) if average else 0.0

        # Формируем author_info
        if book.author:
            book.author_info = AuthorInfoSchema.from_orm(book.author)
        elif book.uploader:
            book.author_info = UserAuthorInfoSchema.from_orm(book.uploader)
        else:
            book.author_info = None

    return books


@router.get("/books/search", response_model=List[BookSchema])
async def search_books(q: Optional[str] = Query(None, min_length=1), db: AsyncSession = Depends(get_db)):
    logging.info(f"Search query received: {q}")
    if not q:
        return []

    stmt = (
        select(Book)
        .join(Author, Book.id_author == Author.id, isouter=True)
        .options(
            selectinload(Book.genres),
            selectinload(Book.author),
            selectinload(Book.uploader),
        )
        .where(
            or_(
                Book.title.ilike(f"%{q}%"),
                Author.name.ilike(f"%{q}%")
            )
        )
    )
    result = await db.execute(stmt)
    books = result.scalars().unique().all()

    for book in books:
        avg = await db.execute(
            select(func.avg(Rating.rating)).where(Rating.id_book == book.id)
        )
        average = avg.scalar()
        book.average_rating = round(float(average), 2) if average else 0.0

        if book.author:
            book.author_info = AuthorInfoSchema.from_orm(book.author)
        elif book.uploader:
            book.author_info = UserAuthorInfoSchema.from_orm(book.uploader)
        else:
            book.author_info = None

    return books


@router.get("/books/filter", response_model=PaginatedBooksSchema)
async def filter_books(
    genre_ids: Optional[List[int]] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=50),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Book).options(
        selectinload(Book.genres),
        selectinload(Book.author),
        selectinload(Book.uploader),
    )
    if genre_ids:
        stmt = stmt.join(Book.genres).where(Genre.id.in_(genre_ids))
    if min_price is not None:
        stmt = stmt.where(Book.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Book.price <= max_price)

    total_stmt = select(func.count(Book.id))
    if genre_ids:
        total_stmt = total_stmt.select_from(Book).join(Book.genres).where(Genre.id.in_(genre_ids))
    if min_price is not None:
        total_stmt = total_stmt.where(Book.price >= min_price)
    if max_price is not None:
        total_stmt = total_stmt.where(Book.price <= max_price)

    total_result = await db.execute(total_stmt)
    total = total_result.scalar() or 0

    stmt = stmt.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(stmt)
    books = result.scalars().unique().all()

    for book in books:
        avg = await db.execute(
            select(func.avg(Rating.rating)).where(Rating.id_book == book.id)
        )
        average = avg.scalar()
        book.average_rating = round(float(average), 2) if average else 0.0

        if book.author:
            book.author_info = AuthorInfoSchema.from_orm(book.author)
        elif book.uploader:
            book.author_info = UserAuthorInfoSchema.from_orm(book.uploader)
        else:
            book.author_info = None

    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "books": books
    }


@router.get("/books/free", response_model=List[BookSchema])
async def get_free_books(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Book)
        .where(Book.price == 0)
        .options(
            selectinload(Book.genres),
            selectinload(Book.author),
            selectinload(Book.uploader),
        )
    )
    books = result.scalars().all()

    for book in books:
        avg = await db.execute(
            select(func.avg(Rating.rating)).where(Rating.id_book == book.id)
        )
        average = avg.scalar()
        book.average_rating = round(float(average), 2) if average else 0.0

        if book.author:
            book.author_info = AuthorInfoSchema.from_orm(book.author)
        elif book.uploader:
            book.author_info = UserAuthorInfoSchema.from_orm(book.uploader)
        else:
            book.author_info = None

    return books

@router.get("/books/top", response_model=List[BookSchema])
async def get_top_books(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Book)
        .options(
            selectinload(Book.genres),
            selectinload(Book.author),
            selectinload(Book.uploader),
        )
    )
    books = result.scalars().all()

    top_books = []
    for book in books:
        avg = await db.execute(
            select(func.avg(Rating.rating)).where(Rating.id_book == book.id)
        )
        average = avg.scalar()
        avg_rating = round(float(average), 2) if average else 0.0
        if avg_rating >= 4.5:
            book.average_rating = avg_rating

            if book.author:
                book.author_info = AuthorInfoSchema.from_orm(book.author)
            elif book.uploader:
                book.author_info = UserAuthorInfoSchema.from_orm(book.uploader)
            else:
                book.author_info = None

            top_books.append(book)

    return top_books


@router.get("/books/{book_id}", response_model=BookSchema)
async def get_book(book_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Book)
        .options(
            selectinload(Book.genres),
            selectinload(Book.author),
            selectinload(Book.uploader),
        )
        .where(Book.id == book_id)
    )
    book = result.scalars().first()
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")

    avg = await db.execute(
        select(func.avg(Rating.rating)).where(Rating.id_book == book_id)
    )
    average = avg.scalar()
    book.average_rating = round(float(average), 2) if average else 0.0

    if book.author:
        book.author_info = AuthorInfoSchema.from_orm(book.author)
    elif book.uploader:
        book.author_info = UserAuthorInfoSchema.from_orm(book.uploader)
    else:
        book.author_info = None

    return book

@router.post("/books/rate", status_code=201)
async def rate_book(
    rating_data: RatingCreateSchema = Body(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.id_role == 3:
        raise HTTPException(status_code=403, detail="Гости не могут ставить оценки")

    if rating_data.rating < 1 or rating_data.rating > 5:
        raise HTTPException(status_code=400, detail="Рейтинг должен быть от 1 до 5")

    book = await db.get(Book, rating_data.id_book)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")

    # Проверка покупки
    purchase = await db.execute(
        select(PurchaseHistory).where(
            PurchaseHistory.user_id == current_user.id,
            PurchaseHistory.book_id == rating_data.id_book
        )
    )
    if not purchase.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Можно ставить рейтинг только купленным книгам")

    existing = await db.execute(
        select(Rating).where(
            Rating.id_user == current_user.id,
            Rating.id_book == rating_data.id_book
        )
    )
    rating_obj = existing.scalar_one_or_none()

    if rating_obj:
        rating_obj.rating = rating_data.rating
    else:
        rating_obj = Rating(
            rating=rating_data.rating,
            id_user=current_user.id,
            id_book=rating_data.id_book
        )
        db.add(rating_obj)

    await db.commit()
    return {"detail": "Рейтинг сохранён"}

@router.post("/upload-book")
async def upload_book(
    title: str = Form(...),
    description: str = Form(...),
    publication_date: str = Form(...),
    pages: int = Form(...),
    price: float = Form(...),
    id_genres: List[int] = Form([]),
    photo: UploadFile | None = File(None),
    content: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(author_role_checker),
):
    UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    photo_path = None
    if photo:
        photo_filename = f"{uuid.uuid4().hex}_{photo.filename}"
        photo_file_path = UPLOAD_DIR / photo_filename
        with open(photo_file_path, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        photo_path = f"/uploads/{photo_filename}"

    content_filename = f"{uuid.uuid4().hex}_{content.filename}"
    content_file_path = UPLOAD_DIR / content_filename
    with open(content_file_path, "wb") as f:
        shutil.copyfileobj(content.file, f)
    content_path = f"/uploads/{content_filename}"

    pub_date = datetime.strptime(publication_date, "%Y-%m-%d").date()

    # Получаем объекты жанров
    genres = []
    for id_genre in id_genres:
        genre = await db.get(Genre, id_genre)
        if genre:
            genres.append(genre)

    new_book = Book(
        title=title,
        description=description,
        publication_date=pub_date,
        pages=pages,
        price=price,
        photo=photo_path,
        content=content_path,
        id_author=None,
        uploaded_by_user_id=current_user.id,
        genres=genres,  # Привязываем жанры сразу
    )

    db.add(new_book)
    await db.commit()
    await db.refresh(new_book)

    return {"detail": "Книга успешно загружена", "book_id": new_book.id}

@router.post("/upload-book-admin")
async def upload_book_admin(
    title: str = Form(...),
    description: str = Form(...),
    publication_date: str = Form(...),
    pages: int = Form(...),
    price: float = Form(...),
    id_genres: List[int] = Form([]),
    id_author: int = Form(...),
    photo: UploadFile | None = File(None),
    content: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"])),  # Только админ
):
    UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    photo_path = None
    if photo:
        photo_filename = f"{uuid.uuid4().hex}_{photo.filename}"
        photo_file_path = UPLOAD_DIR / photo_filename
        with open(photo_file_path, "wb") as f:
            shutil.copyfileobj(photo.file, f)
        photo_path = f"/uploads/{photo_filename}"

    content_filename = f"{uuid.uuid4().hex}_{content.filename}"
    content_file_path = UPLOAD_DIR / content_filename
    with open(content_file_path, "wb") as f:
        shutil.copyfileobj(content.file, f)
    content_path = f"/uploads/{content_filename}"

    pub_date = datetime.strptime(publication_date, "%Y-%m-%d").date()

    # Получаем объекты жанров
    genres = []
    for id_genre in id_genres:
        genre = await db.get(Genre, id_genre)
        if genre:
            genres.append(genre)

    # Проверяем, что классический автор существует
    author = await db.get(Author, id_author)
    if not author:
        raise HTTPException(status_code=400, detail="Автор не найден")

    new_book = Book(
        title=title,
        description=description,
        publication_date=pub_date,
        pages=pages,
        price=price,
        photo=photo_path,
        content=content_path,
        id_author=id_author,
        uploaded_by_user_id=None,  # Нет пользователя-загрузчика
        genres=genres,
    )

    db.add(new_book)
    await db.commit()
    await db.refresh(new_book)

    return {"detail": "Книга успешно загружена", "book_id": new_book.id}

@router.post("/genres", status_code=status.HTTP_201_CREATED)
async def create_genre(
    genre: GenreCreateSchema = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(RoleChecker(["admin"]))
):
    existing = await db.execute(select(Genre).where(Genre.title == genre.title))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Жанр с таким названием уже существует")

    new_genre = Genre(title=genre.title)
    db.add(new_genre)
    await db.commit()
    await db.refresh(new_genre)
    return new_genre

@router.get("/books/download/{book_id}")
async def download_book(book_id: int, db: AsyncSession = Depends(get_db)):
    # Получаем книгу из БД
    book = await db.get(Book, book_id)
    if not book or not book.content:
        raise HTTPException(status_code=404, detail="Книга не найдена или файл отсутствует")

    # Формируем полный путь к файлу
    base_upload_dir = SysPath(__file__).resolve().parent.parent.parent / "uploads"
    file_path = base_upload_dir / SysPath(book.content).name  # предполагается, что content хранит относительный путь

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Файл книги не найден на сервере")

    # Возвращаем файл с заголовком attachment, чтобы браузер скачивал файл
    return FileResponse(
        path=str(file_path),
        media_type="application/epub+zip",  # MIME для epub
        filename=file_path.name,
        headers={"Content-Disposition": f'attachment; filename="{file_path.name}"'}
    )

@router.delete("/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(book_id: int, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if current_user.id_role != 1:  # Проверка, что пользователь — админ
        raise HTTPException(status_code=403, detail="Только администратор может удалять книги")

    book = await db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")

    await db.execute(delete(Book).where(Book.id == book_id))
    await db.commit()
    return None

@router.delete("/groups/{group_id}/books/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book_from_group(
    group_id: int,
    book_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if current_user.id_role != 1:
        raise HTTPException(status_code=403, detail="Только администратор может удалять книги из групп")

    # Проверяем, что группа существует
    group = await db.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Группа не найдена")

    # Проверяем, что книга существует
    book = await db.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Книга не найдена")

    # Удаляем связь книги с группой
    await db.execute(
        delete(GroupBook).where(
            GroupBook.group_id == group_id,
            GroupBook.book_id == book_id
        )
    )
    await db.commit()
    return None

@router.get("/report/sales", dependencies=[Depends(RoleChecker(["admin"]))])
async def get_sales_report(db: AsyncSession = Depends(get_db)):
    # Получаем все покупки для отладки
    all_purchases = await db.execute(select(PurchaseHistory))
    all_purchases_list = all_purchases.scalars().all()
    print("ВСЕ ПОКУПКИ:", all_purchases_list)
    
    # Ваш основной запрос
    result = await db.execute(
        select(
            Book.id,
            Book.title,
            func.sum(PurchaseHistory.quantity).label("sold_count")
        )
        .join(PurchaseHistory, PurchaseHistory.book_id == Book.id)
        .group_by(Book.id)
        .order_by(func.sum(PurchaseHistory.quantity).desc())
    )
    sales = [
        {"id": row[0], "title": row[1], "sold_count": row[2] or 0}
        for row in result.all()
    ]
    print("SALES:", sales)

    total_result = await db.execute(
        select(func.sum(PurchaseHistory.quantity))
    )
    total_sold = total_result.scalar() or 0
    print("TOTAL SOLD:", total_sold)

    return {"total_sold": total_sold, "books": sales}
