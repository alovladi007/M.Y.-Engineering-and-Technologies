"""API endpoint tests for Power Platform."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.db.models import Project, Run, RunStatus


class TestHealthEndpoint:
    """Tests for health check endpoint."""

    def test_health_check(self, client: TestClient):
        """Test health endpoint returns 200."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


class TestTopologyEndpoints:
    """Tests for topology simulation endpoints."""

    def test_list_topologies(self, client: TestClient):
        """Test listing available topologies."""
        response = client.get("/api/v1/sim/topologies/list")
        assert response.status_code == 200
        data = response.json()
        assert "topologies" in data
        assert "dab_single" in data["topologies"]
        assert "dab_three" in data["topologies"]

    def test_create_simulation(self, client: TestClient, test_project: Project):
        """Test creating a new simulation run."""
        payload = {
            "project_id": test_project.id,
            "topology": "dab_single",
            "params": {
                "vin": 400,
                "vout": 400,
                "pout": 10000,
                "fsw": 100000,
                "n": 1.0,
                "llk": 10e-6,
                "deadtime": 100e-9,
                "phi_deg": 15.0
            }
        }
        response = client.post("/api/v1/sim/topologies/simulate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "run_id" in data
        assert data["status"] == "queued"
        assert "task_id" in data["message"]

    def test_create_simulation_invalid_topology(self, client: TestClient, test_project: Project):
        """Test creating simulation with invalid topology."""
        payload = {
            "project_id": test_project.id,
            "topology": "invalid_topology",
            "params": {}
        }
        response = client.post("/api/v1/sim/topologies/simulate", json=payload)
        assert response.status_code == 400
        assert "Unknown topology" in response.json()["detail"]

    def test_get_simulation_results(self, client: TestClient, test_run: Run):
        """Test retrieving simulation results."""
        response = client.get(f"/api/v1/sim/topologies/run/{test_run.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_run.id
        assert data["status"] == "pending"
        assert data["topology"] == "dab_single"

    def test_get_simulation_waveforms(self, client: TestClient, test_run: Run, db: Session):
        """Test retrieving waveform data."""
        # Add results to run
        test_run.results_json = {
            "waveforms": {
                "time": [0, 1e-6, 2e-6],
                "v_pri": [400, 0, 400],
                "i_pri": [10, 20, 10]
            }
        }
        db.commit()

        response = client.get(f"/api/v1/sim/topologies/run/{test_run.id}/waveforms")
        assert response.status_code == 200
        data = response.json()
        assert "waveforms" in data
        assert "time" in data["waveforms"]
        assert len(data["waveforms"]["time"]) == 3


class TestProjectEndpoints:
    """Tests for project management endpoints."""

    def test_list_projects(self, client: TestClient, test_project: Project):
        """Test listing projects."""
        response = client.get("/api/v1/projects")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert data[0]["name"] == test_project.name

    def test_create_project(self, client: TestClient, test_org):
        """Test creating a new project."""
        payload = {
            "name": "New Test Project",
            "description": "A new project for testing"
        }
        response = client.post("/api/v1/projects", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "New Test Project"
        assert data["org_id"] == test_org.id

    def test_get_project(self, client: TestClient, test_project: Project):
        """Test getting a specific project."""
        response = client.get(f"/api/v1/projects/{test_project.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_project.id
        assert data["name"] == test_project.name


class TestZVSEndpoints:
    """Tests for ZVS analysis endpoints."""

    def test_check_zvs(self, client: TestClient):
        """Test ZVS condition checking."""
        payload = {
            "vin": 400,
            "vout": 400,
            "n": 1.0,
            "llk": 10e-6,
            "fsw": 100000,
            "coss": 120e-12,
            "deadtime": 100e-9,
            "phi_deg": 15.0,
            "pout": 10000
        }
        response = client.post("/api/v1/sim/zvs/check", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "zvs_achieved" in data
        assert "margin" in data
        assert isinstance(data["zvs_achieved"], bool)

    def test_generate_zvs_map(self, client: TestClient):
        """Test ZVS feasibility map generation."""
        payload = {
            "vin": 400,
            "vout": 400,
            "n": 1.0,
            "llk": 10e-6,
            "fsw": 100000,
            "coss": 120e-12,
            "deadtime": 100e-9
        }
        response = client.post("/api/v1/sim/zvs/map", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "phi_deg" in data
        assert "load_percent" in data
        assert "zvs_map" in data


class TestDeviceLibrary:
    """Tests for device library endpoints."""

    def test_list_devices(self, client: TestClient):
        """Test listing available devices."""
        response = client.get("/api/v1/devices")
        assert response.status_code == 200
        data = response.json()
        assert "devices" in data
        assert isinstance(data["devices"], list)

    def test_get_device_params(self, client: TestClient):
        """Test retrieving device parameters."""
        # First get the list to find a valid device
        list_response = client.get("/api/v1/devices")
        devices = list_response.json()["devices"]

        if len(devices) > 0:
            device_name = devices[0]["name"]
            response = client.get(f"/api/v1/devices/{device_name}")
            assert response.status_code == 200
            data = response.json()
            assert "rds_on_25c" in data
            assert "coss" in data


class TestAuthenticationEndpoints:
    """Tests for authentication endpoints."""

    def test_get_current_user(self, client: TestClient, test_user):
        """Test getting current authenticated user."""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user.email
        assert data["name"] == test_user.name
