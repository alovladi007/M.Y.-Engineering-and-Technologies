"""Pytest configuration and fixtures for Power Platform tests."""
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool

from app.main import app
from app.db.base import Base
from app.db.session import get_db
from app.db.models import User, Org, Project, Run, RunStatus
from app.deps import get_current_user, get_current_org


# Test database setup
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db() -> Generator[Session, None, None]:
    """Create a fresh database session for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_user(db: Session) -> User:
    """Create a test user."""
    user = User(
        email="test@example.com",
        name="Test User",
        role="admin"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture(scope="function")
def test_org(db: Session) -> Org:
    """Create a test organization."""
    org = Org(
        name="Test Organization",
        slug="test-org"
    )
    db.add(org)
    db.commit()
    db.refresh(org)
    return org


@pytest.fixture(scope="function")
def test_project(db: Session, test_org: Org) -> Project:
    """Create a test project."""
    project = Project(
        name="Test Project",
        org_id=test_org.id,
        description="Test project for simulations"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@pytest.fixture(scope="function")
def test_run(db: Session, test_project: Project) -> Run:
    """Create a test simulation run."""
    run = Run(
        project_id=test_project.id,
        topology="dab_single",
        params_json={
            "vin": 400,
            "vout": 400,
            "pout": 10000,
            "fsw": 100000,
            "n": 1.0,
            "llk": 10e-6,
            "deadtime": 100e-9
        },
        status=RunStatus.PENDING
    )
    db.add(run)
    db.commit()
    db.refresh(run)
    return run


@pytest.fixture(scope="function")
def client(db: Session, test_user: User, test_org: Org) -> TestClient:
    """Create a test client with database and authentication overrides."""

    def override_get_db():
        try:
            yield db
        finally:
            pass

    def override_get_current_user():
        return test_user

    def override_get_current_org():
        return test_org

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_current_org] = override_get_current_org

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def dab_params():
    """Standard DAB simulation parameters for testing."""
    return {
        "vin": 400.0,
        "vout": 400.0,
        "pout": 10000.0,
        "fsw": 100000.0,
        "n": 1.0,
        "llk": 10e-6,
        "deadtime": 100e-9,
        "phi_deg": 15.0
    }


@pytest.fixture
def device_params():
    """Standard device parameters for testing."""
    return {
        "rds_on_25c": 0.010,
        "rds_on_125c": 0.015,
        "eon": 100e-6,
        "eoff": 50e-6,
        "qg": 100e-9,
        "vf": 1.5,
        "trr": 20e-9,
        "qrr": 150e-9,
        "tj_max": 175,
        "rth_jc": 0.5,
        "rth_ja": 40,
        "coss": 120e-12
    }
