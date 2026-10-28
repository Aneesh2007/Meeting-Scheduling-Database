from typing import Any
from app.database import fetch_all, fetch_one

CATEGORY = "03_users"


def get_user(user_id: int) -> dict[str, Any] | None:
    """params: $1 user_id"""
    return fetch_one(CATEGORY, "get_user.sql", user_id)


# Alias kept for backward compatibility with app/api/users.py
get_user_by_id = get_user


def get_user_by_email(email: str) -> dict[str, Any] | None:
    """params: $1 email"""
    return fetch_one(CATEGORY, "get_user_by_email.sql", email)


def get_user_by_username(username: str) -> dict[str, Any] | None:
    """params: $1 username"""
    return fetch_one(CATEGORY, "get_user_by_username.sql", username)


def find_user(query: str, limit: int = 10) -> list[dict[str, Any]]:
    """params: $1 query (name or email fragment), $2 limit"""
    return fetch_all(CATEGORY, "find_user.sql", query, limit)
