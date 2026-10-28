import asyncio
from app.database import pool
from app.services.schema import init_db

async def main():
    pool.open()
    try:
        init_db()
        print("Schema initialized successfully")
    finally:
        pool.close()

asyncio.run(main())


