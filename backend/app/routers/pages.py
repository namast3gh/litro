from fastapi import APIRouter

router = APIRouter()

@router.get("/page1")
async def get_page1():
    return {"page": "This is page 11"}

@router.get("/page2")
async def get_page2():
    return {"page": "This is page 2"}