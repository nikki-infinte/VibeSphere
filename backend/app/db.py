from sqlalchemy import create_engine, text
from sqlalchemy.engine.url import make_url
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


def ensure_postgres_database_exists(database_url: str) -> None:
    """
    If DATABASE_URL points to PostgreSQL and the target database does not exist,
    create it automatically by connecting to the default 'postgres' database.
    """
    url = make_url(database_url)
    if not url.drivername.startswith("postgresql"):
        return

    db_name = url.database
    if not db_name:
        return

    # Fast path: database exists and is reachable.
    try:
        test_engine = create_engine(database_url, future=True)
        with test_engine.connect():
            pass
        test_engine.dispose()
        return
    except OperationalError as exc:
        # Handle only missing database case; re-raise other connection errors.
        msg = str(exc).lower()
        if "does not exist" not in msg and "unknown database" not in msg:
            raise

    admin_url = url.set(database="postgres")
    admin_engine = create_engine(admin_url, future=True, isolation_level="AUTOCOMMIT")
    try:
        with admin_engine.connect() as conn:
            exists = conn.execute(
                text("SELECT 1 FROM pg_database WHERE datname = :db_name"),
                {"db_name": db_name},
            ).scalar()
            if not exists:
                conn.execute(text(f'CREATE DATABASE "{db_name}"'))
    finally:
        admin_engine.dispose()


ensure_postgres_database_exists(settings.database_url)
engine = create_engine(settings.database_url, future=True)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
