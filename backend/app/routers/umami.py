from fastapi import APIRouter, HTTPException
import httpx
import logging
import time

router = APIRouter()

UMAMI_API_KEY = "api_Rh31fkqcgnY6JqXcJejHXs7BbjMVLmW1"

@router.get("/umami/stats")
async def get_umami_stats():
    now = int(time.time() * 1000)
    seven_days_ago = now - 7 * 24 * 60 * 60 * 1000
    url = (
        f"https://api.umami.is/v1/websites/8bca10d0-fdf5-4e2e-a57a-fddcd844f1a0/stats"
        f"?startAt={seven_days_ago}&endAt={now}"
    )
    headers = {
        "x-umami-api-key": UMAMI_API_KEY,
        "Accept": "application/json"
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        logging.info(f"Umami API response status: {response.status_code}")
        logging.info(f"Umami API response body: {response.text}")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail=f"Ошибка Umami API: {response.text}")
        return response.json()
