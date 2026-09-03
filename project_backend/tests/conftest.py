import os

# Must be set BEFORE any "from app..." import anywhere in this test suite,
# since app.db.config instantiates Settings() the moment it's imported.
os.environ.setdefault("SECRET_KEY", "test-secret")
os.environ.setdefault("DEBUG", "true")
os.environ.setdefault("MODEL_PATH", "test-path")
os.environ.setdefault("MODEL_NAME", "test-model")
os.environ.setdefault("MEMOIZATION_FLAG", "false")
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql://testuser:testpass@localhost:5433/testdb"
)

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture()
def client():
    # TestClient used as a context manager triggers the app's real
    # lifespan startup/shutdown — connect() runs against the TEST db
    # (port 5433), disconnect() runs automatically after.
    with TestClient(app) as c:
        yield c