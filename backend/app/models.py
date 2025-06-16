# models.py (FastAPI + SQLAlchemy версия)
from sqlalchemy import Column, Integer, String, Text, Date, Float, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship, backref
from sqlalchemy.dialects.postgresql import BYTEA
from .database import Base
from datetime import datetime

class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True)
    name = Column(String(64), unique=True, nullable=False)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(64), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password = Column(String(120), nullable=False)
    id_role = Column(Integer, ForeignKey('roles.id'), nullable=False)
    role = relationship('Role', backref='users')
    photo = Column(String(255))
    biography = Column(String(1000), nullable=True)
    name = Column(String(255), nullable=True)
    
    def get_current_role(self):
        return self.role.name if self.role else None

    def is_guest(self):
        return self.role and self.role.name == 'guest'

class Author(Base):
    __tablename__ = 'authors'
    id = Column(Integer, primary_key=True)
    name = Column(String(150), nullable=False)
    biography = Column(String(1000), nullable=True)
    books = relationship('Book', back_populates='author', cascade='all, delete-orphan')

class Genre(Base):
    __tablename__ = 'genres'
    id = Column(Integer, primary_key=True)
    title = Column(String(64), nullable=False)

class Book(Base):
    __tablename__ = 'books'
    id = Column(Integer, primary_key=True)
    title = Column(String(64), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    publication_date = Column(Date, nullable=False)
    pages = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    content = Column(String(255), nullable=True, unique=True)
    photo = Column(String(255))

    # Классический автор (например, Пушкин) - может быть NULL, если книга пользователя
    id_author = Column(Integer, ForeignKey('authors.id'), nullable=True)
    author = relationship('Author', back_populates='books')

    # Пользователь, загрузивший книгу (обязателен)
    uploaded_by_user_id = Column(Integer, ForeignKey('users.id'), nullable=True)
    uploader = relationship('User')

    genres = relationship('Genre', secondary='books_genres', backref='books')

    groups = relationship('Group', secondary='group_books', back_populates='books')

class BookGenre(Base):
    __tablename__ = 'books_genres'
    id_book = Column(Integer, ForeignKey('books.id', ondelete="CASCADE"), primary_key=True)
    id_genre = Column(Integer, ForeignKey('genres.id', ondelete="CASCADE"), primary_key=True)

class Group(Base):
    __tablename__ = 'groups'
    id = Column(Integer, primary_key=True)
    title = Column(String(64), nullable=False)
    description = Column(Text, nullable=True)

    books = relationship('Book', secondary='group_books', back_populates='groups')

class GroupBook(Base):
    __tablename__ = 'group_books'
    group_id = Column(Integer, ForeignKey('groups.id', ondelete="CASCADE"), primary_key=True)
    book_id = Column(Integer, ForeignKey('books.id', ondelete="CASCADE"), primary_key=True)

class Comment(Base):
    __tablename__ = 'comments'
    id = Column(Integer, primary_key=True)
    text = Column(Text, nullable=False)
    date = Column(Date, nullable=False)
    id_user = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    id_book = Column(Integer, ForeignKey('books.id', ondelete="CASCADE"), nullable=False)
    
    user = relationship('User', backref='comments')
    book = relationship('Book', backref='comments')

class Rating(Base):
    __tablename__ = 'ratings'
    id = Column(Integer, primary_key=True)
    rating = Column(Integer, nullable=True)
    id_user = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    id_book = Column(Integer, ForeignKey('books.id', ondelete="CASCADE"), nullable=False)
    
    user = relationship('User', backref='ratings')
    book = relationship('Book', backref='ratings')

class Cart(Base):
    __tablename__ = 'carts'
    id = Column(Integer, primary_key=True)
    id_user = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    user = relationship('User', backref='carts')

class CartItem(Base):
    __tablename__ = 'cart_items'
    id = Column(Integer, primary_key=True)
    id_cart = Column(Integer, ForeignKey('carts.id', ondelete="CASCADE"), nullable=False)
    id_book = Column(Integer, ForeignKey('books.id', ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=1)
    
    cart = relationship('Cart', backref='items')
    book = relationship('Book', backref='cart_items')

class PurchaseHistory(Base):
    __tablename__ = 'purchase_history'
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete="CASCADE"), nullable=False)
    book_id = Column(Integer, ForeignKey('books.id', ondelete="CASCADE"), nullable=False)
    purchase_date = Column(DateTime, default=datetime.utcnow)
    quantity = Column(Integer, default=1)
    
    user = relationship('User', backref='purchases')
    book = relationship('Book', backref='purchased_by')