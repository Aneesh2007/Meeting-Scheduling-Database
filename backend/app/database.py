from contextlib import asynccontextmanager
from psycopg_pool import ConnectionPool
from app.config import settings

pool = ConnectionPool(
    conninfo=settings.DATABASE_URL,
    min_size=2,
    max_size=10,
    open=False,
)

@asynccontextmanager
async def lifespan(app):
    pool.open()
    try:
        yield
    finally:
        pool.close()
