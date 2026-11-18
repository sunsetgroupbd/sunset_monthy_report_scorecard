import pytest
from datetime import date, datetime, timezone
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app
from app.models.models import Team, Profile, ManualScorecard, ManualScorecardPeriod, ManualScorecardCustomer
from app.core.security import create_access_token

# In-memory SQLite database for test suite
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()

    # Seed test teams
    team1 = Team(id="team-alpha", name="Alpha Team", code="ALPHA", description="Team Alpha")
    team2 = Team(id="team-beta", name="Beta Team", code="BETA", description="Team Beta")
    session.add_all([team1, team2])
    session.flush()

    # Seed test users
    admin = Profile(
        id="usr-admin",
        employee_id="10000001",
        full_name="Admin User",
        email="admin@test.com",
        designation="Admin Lead",
        team_id=team1.id,
        joining_date=date(2022, 1, 1),
        role="ADMIN",
        is_active=True
    )
    tl = Profile(
        id="usr-tl",
        employee_id="10000002",
        full_name="Team Leader",
        email="tl@test.com",
        designation="Team Leader",
        team_id=team1.id,
        joining_date=date(2022, 1, 1),
        role="TL",
        supervisor_id=admin.id,
        is_active=True
    )
    co = Profile(
        id="usr-co",
        employee_id="10000003",
        full_name="Coordinator",
        email="co@test.com",
        designation="Coordinator",
        team_id=team1.id,
        joining_date=date(2022, 1, 1),
        role="CO",
        supervisor_id=tl.id,
        is_active=True
    )
    emp1 = Profile(
        id="usr-emp1",
        employee_id="10000004",
        full_name="Employee One",
        email="emp1@test.com",
        designation="Relationship Officer",
        team_id=team1.id,
        joining_date=date(2023, 1, 1),
        role="EMPLOYEE",
        supervisor_id=tl.id,
        is_active=True
    )
    emp2 = Profile(
        id="usr-emp2",
        employee_id="10000005",
        full_name="Employee Two (Other Team)",
        email="emp2@test.com",
        designation="Relationship Officer",
        team_id=team2.id,
        joining_date=date(2023, 1, 1),
        role="EMPLOYEE",
        supervisor_id=None,
        is_active=True
    )

    session.add_all([admin, tl, co, emp1, emp2])
    session.commit()

    yield session

    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def make_auth_headers(user_id: str, email: str, role: str = "authenticated") -> dict:
    token = create_access_token({
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": int((datetime.now(timezone.utc)).timestamp()) + 3600
    })
    return {"Authorization": f"Bearer {token}"}
