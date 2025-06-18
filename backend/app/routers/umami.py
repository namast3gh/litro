from fastapi import APIRouter, HTTPException
import httpx
import logging

router = APIRouter()

UMAMI_API_KEY = "api_Rh31fkqcgnY6JqXcJejHXs7BbjMVLmW1"
UMAMI_API_URL = "https://api.umami.is/v1/websites/8bca10d0-fdf5-4e2e-a57a-fddcd844f1a0/stats/overview"

@router.get("/umami/stats")
async def get_umami_stats():
    headers = {
        "x-umami-api-key": UMAMI_API_KEY,
        "Accept": "application/json"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(UMAMI_API_URL, headers=headers)
        logging.info(f"Umami API response status: {response.status_code}")
        logging.info(f"Umami API response body: {response.text}")
        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Ошибка Umami API: {response.text}"
            )
        return response.json()
