from contextlib import asynccontextmanager
from functools import lru_cache
from pathlib import Path
import re
from typing import Any

from psycopg.rows import dict_row
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


QUERIES_DIR = Path(__file__).resolve().parent.parent / "queries"
_PARAM_REGEX = re.compile(r"\$(\d+)\b")


@lru_cache(maxsize=None)
def load_query(category: str, filename: str) -> str:
    """
    Loads a .sql file from backend/queries/<category>/<filename>
    and converts PostgreSQL $1, $2 placeholders to psycopg %(p1)s, %(p2)s.
    """
    if not filename.endswith(".sql"):
        filename = f"{filename}.sql"
    raw_sql = (QUERIES_DIR / category / filename).read_text(encoding="utf-8")
    return _PARAM_REGEX.sub(r"%(p\1)s", raw_sql)


def _bind_params(args: tuple[Any, ...]) -> dict[str, Any]:
    return {f"p{i}": val for i, val in enumerate(args, start=1)}


def fetch_one(category: str, filename: str, *args: Any, commit: bool = False) -> dict[str, Any] | None:
    sql = load_query(category, filename)
    params = _bind_params(args)
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(sql, params)
            row = cur.fetchone()
        if commit:
            conn.commit()
        return row


def fetch_all(category: str, filename: str, *args: Any, commit: bool = False) -> list[dict[str, Any]]:
    sql = load_query(category, filename)
    params = _bind_params(args)
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
        if commit:
            conn.commit()
        return rows


def execute_script(category: str, filename: str) -> None:
    """Executes a raw SQL DDL script (e.g., migrations and views)."""
    if not filename.endswith(".sql"):
        filename = f"{filename}.sql"
    raw_sql = (QUERIES_DIR / category / filename).read_text(encoding="utf-8")
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(raw_sql)
        conn.commit()
