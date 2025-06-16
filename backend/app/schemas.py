from pydantic import BaseModel, EmailStr, constr
from typing import Optional, List, Union
from datetime import date, datetime

class AuthorSchema(BaseModel):
    id: int
    name: str
    biography: Optional[str] = ""

    class Config:
        from_attributes = True

class GenreSchema(BaseModel):
    id: int
    title: str

    class Config:
        from_attributes = True

class UserSchema(BaseModel):
    id: int
    username: str
    email: EmailStr
    id_role: int
    role: Optional[str] = None
    photo: str
    biography: str

    class Config:
        from_attributes = True

class UserCreateSchema(BaseModel):
    username: constr(min_length=3, max_length=50)
    email: EmailStr
    password: constr(min_length=6)
    id_role: int  # 1 - admin, 2 - user, 3 - guest, 4 - author
    name: Optional[str] = None
    biography: Optional[str] = None

class UserUpdateSchema(BaseModel):
    username: constr(min_length=3, max_length=50) | None = None
    email: EmailStr | None = None
    old_password: str | None = None
    new_password: constr(min_length=6) | None = None
    biography: str | None = None
    name: str | None = None

class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str

class TokenSchema(BaseModel):
    access_token: str
    token_type: str

# Новые схемы для автора (классический и пользователь)
class AuthorInfoSchema(BaseModel):
    id: int
    name: str
    biography: Optional[str] = ""

    class Config:
        from_attributes = True

class UserAuthorInfoSchema(BaseModel):
    id: int
    username: str
    biography: Optional[str] = None
    photo: Optional[str] = None

    class Config:
        from_attributes = True

class BookSchema(BaseModel):
    id: int
    title: str
    description: str
    publication_date: date
    pages: int
    price: float
    photo: Optional[str]
    id_author: Optional[int]
    content: Optional[str]
    genres: list["GenreSchema"] = []
    average_rating: Optional[float] = 0.0

    # Добавляем поле для автора (классического или пользователя)
    author_info: Optional[Union[AuthorInfoSchema, UserAuthorInfoSchema]] = None

    class Config:
        from_attributes = True

class PaginatedBooksSchema(BaseModel):
    total: int
    page: int
    page_size: int
    books: List[BookSchema]

    class Config:
        from_attributes = True

class GroupSchema(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    books: List[BookSchema] = []

    class Config:
        from_attributes = True

class RatingCreateSchema(BaseModel):
    rating: int  # 1-5
    id_book: int

class RatingSchema(BaseModel):
    id: int
    rating: int
    id_user: int
    id_book: int

    class Config:
        from_attributes = True

class CommentCreateSchema(BaseModel):
    text: str
    id_book: int

class CommentSchema(BaseModel):
    id: int
    text: str
    date: date
    id_user: int
    id_book: int
    user_name: Optional[str] = None
    user_photo: Optional[str] = None

    class Config:
        from_attributes = True

class PurchaseHistorySchema(BaseModel):
    id: int
    book: BookSchema
    purchase_date: datetime
    quantity: int
    user_rating: Optional[RatingSchema] = None
    user_comment: Optional[CommentSchema] = None

    class Config:
        from_attributes = True

class GenreCreateSchema(BaseModel):
    title: str

    class Config:
        from_attributes = True