from app.database import execute_script

CATEGORY = "00_schema"


def run_migrations() -> None:
    execute_script(CATEGORY, "001_migrations.sql")


def create_views() -> None:
    execute_script(CATEGORY, "002_views.sql")


def init_db() -> None:
    run_migrations()
    create_views()
