# app/routers/umami.py
from fastapi import APIRouter, HTTPException
import httpx

router = APIRouter()

UMAMI_API_TOKEN = "api_xdGUZXsFcfS5SVvnBw5zOnOlUl30TiEs"
UMAMI_WEBSITE_ID = "8bca10d0-fdf5-4e2e-a57a-fddcd844f1a0"
UMAMI_API_URL = f"https://cloud.umami.is/api/websites/{UMAMI_WEBSITE_ID}/stats/overview"

@router.get("/umami/stats")
async def get_umami_stats():
    headers = {
        "Authorization": f"Bearer {UMAMI_API_TOKEN}"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(UMAMI_API_URL, headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Ошибка Umami API")
        return response.json()
