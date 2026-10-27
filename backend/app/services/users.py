from psycopg.rows import dict_row
from app.database import pool

def get_user_by_id(user_id: int) -> dict | None:
    with pool.connection() as conn:
        with conn.cursor(row_factory=dict_row) as cur:
            cur.execute(
                """
                SELECT user_id, username, email
                FROM users
                WHERE user_id = %s
                """,
                (user_id,),
            )
            return cur.fetchone()
