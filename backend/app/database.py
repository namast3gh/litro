import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@db/library")

engine = create_async_engine(DATABASE_URL, echo=True)  # echo=True для отладки

async_session_maker = async_sessionmaker(bind=engine, expire_on_commit=False)

Base = declarative_base()