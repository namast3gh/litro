from fastapi import APIRouter, HTTPException
import httpx
import logging

router = APIRouter()

UMAMI_API_KEY = "api_Rh31fkqcgnY6JqXcJejHXs7BbjMVLmW1"
UMAMI_API_URL = "https://api.umami.is/v1/websites/8bca10d0-fdf5-4e2e-a57a-fddcd844f1a0/stats"

@router.get("/umami/stats")
async def get_umami_stats():
    headers = {
        "x-umami-api-key": UMAMI_API_KEY,
        "Accept": "application/json"
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(UMAMI_API_URL, headers=headers)
            logging.info(f"Umami API response status: {response.status_code}")
            logging.info(f"Umami API response body: {response.text}")
            response.raise_for_status()  # выбросит исключение для HTTP ошибок
            return response.json()
    except httpx.HTTPStatusError as exc:
        logging.error(f"HTTP error while requesting Umami API: {exc.response.status_code} - {exc.response.text}")
        raise HTTPException(status_code=exc.response.status_code, detail=f"Ошибка Umami API: {exc.response.text}")
    except Exception as exc:
        logging.error(f"Unexpected error: {exc}")
        raise HTTPException(status_code=500, detail="Внутренняя ошибка сервера")
