from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from app.routers import books, auth, login, upload, comments, cart, groups

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://87.228.102.111",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(login.router)
app.include_router(upload.router, prefix="/api/users", tags=["users"])
app.include_router(books.router, prefix="/api/data", tags=["data"])
app.include_router(comments.router, prefix="/api", tags=["comments"])
app.include_router(cart.router, prefix="/api", tags=["cart"])
app.include_router(groups.router, prefix="/api/data", tags=["groups"])


@app.get("/")
async def root():
    return {"message": "Hello from FastAPI backend!"}

BASE_DIR = Path(__file__).resolve().parent.parent
frontend_dist = BASE_DIR / "frontend" / "dist"
assets_path = frontend_dist / "assets"
if assets_path.exists():
    app.mount("/assets", StaticFiles(directory=str(assets_path)), name="assets")
static_path = frontend_dist / "static"
if static_path.exists():
    app.mount("/static", StaticFiles(directory=str(static_path)), name="static")
uploads_path = BASE_DIR / "uploads"
uploads_path.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_path)), name="uploads")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str, request: Request):
    if full_path.startswith(("api", "auth", "books", "login", "pages")):
        return {"detail": "Not Found"}
    index_path = frontend_dist / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"detail": "Frontend build not found"}
