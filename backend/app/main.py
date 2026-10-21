from fastapi import FastAPI
from app.api.users import router as users_router
from app.database import lifespan

app = FastAPI(
    title="backend",
    lifespan=lifespan,
)

app.include_router(users_router)

@app.get("/health")
def health():
    return {"status": "ok"}
