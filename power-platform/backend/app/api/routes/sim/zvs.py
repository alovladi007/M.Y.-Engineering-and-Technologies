"""
ZVS analysis API routes.
"""
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import User, Run, Project
from app.deps import get_current_user, get_current_org
from app.services.sim.zvs.zvs_solver import check_zvs_condition, find_zvs_boundary
from app.services.sim.zvs.zvs_maps import generate_zvs_map, optimize_for_zvs
from pydantic import BaseModel

router = APIRouter(prefix="/zvs", tags=["zvs"])


class ZVSCheckRequest(BaseModel):
    vin: float
    vout: float
    n: float
    llk: float
    i_llk: float
    coss: float
    deadtime: float


class ZVSMapRequest(BaseModel):
    vin: float
    vout: float
    n: float
    llk: float
    fsw: float
    coss: float
    deadtime: float
    device_params: Dict[str, Any]
    power_min: float = 1000.0
    power_max: float = 10000.0
    phi_min: float = 0.0
    phi_max: float = 0.5


class ZVSOptimizeRequest(BaseModel):
    vin: float
    vout: float
    n: float
    llk: float
    fsw: float
    coss: float
    device_params: Dict[str, Any]
    load_points: list[float]  # List of power levels to optimize for


@router.post("/check")
async def check_zvs(
    request: ZVSCheckRequest,
    current_user: User = Depends(get_current_user),
):
    """Check ZVS condition for given parameters."""
    try:
        result = check_zvs_condition(
            vin=request.vin,
            vout=request.vout,
            n=request.n,
            llk=request.llk,
            i_llk=request.i_llk,
            coss=request.coss,
            deadtime=request.deadtime,
        )

        return {
            "zvs_achieved": result.zvs_achieved,
            "energy_available": result.energy_available,
            "energy_required": result.energy_required,
            "margin": result.margin,
            "deadtime_ok": result.deadtime_ok,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ZVS check failed: {str(e)}"
        )


@router.post("/boundary")
async def calculate_boundary(
    request: ZVSCheckRequest,
    current_user: User = Depends(get_current_user),
):
    """Calculate ZVS boundary conditions."""
    try:
        min_current = find_zvs_boundary(
            vin=request.vin,
            vout=request.vout,
            n=request.n,
            llk=request.llk,
            coss=request.coss,
            deadtime=request.deadtime,
        )

        return {
            "min_current_for_zvs": min_current,
            "coss": request.coss,
            "deadtime": request.deadtime,
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Boundary calculation failed: {str(e)}"
        )


@router.post("/map")
async def generate_map(
    request: ZVSMapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Generate ZVS feasibility map over power and phase shift."""
    try:
        zvs_map = generate_zvs_map(
            vin=request.vin,
            vout=request.vout,
            n=request.n,
            llk=request.llk,
            fsw=request.fsw,
            coss=request.coss,
            deadtime=request.deadtime,
            device_params=request.device_params,
            power_range=(request.power_min, request.power_max),
            phi_range=(request.phi_min, request.phi_max),
        )

        return {
            "power_points": zvs_map["power_points"].tolist(),
            "phi_points": zvs_map["phi_points"].tolist(),
            "zvs_matrix": zvs_map["zvs_matrix"].tolist(),
            "efficiency_matrix": zvs_map["efficiency_matrix"].tolist() if "efficiency_matrix" in zvs_map else None,
            "metadata": {
                "vin": request.vin,
                "vout": request.vout,
                "fsw": request.fsw,
                "llk": request.llk,
                "coss": request.coss,
                "deadtime": request.deadtime,
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ZVS map generation failed: {str(e)}"
        )


@router.post("/optimize")
async def optimize_zvs(
    request: ZVSOptimizeRequest,
    current_user: User = Depends(get_current_user),
):
    """Optimize phase shift and deadtime for maximum ZVS coverage."""
    try:
        recommendations = []

        for power_level in request.load_points:
            result = optimize_for_zvs(
                vin=request.vin,
                vout=request.vout,
                n=request.n,
                llk=request.llk,
                fsw=request.fsw,
                coss=request.coss,
                device_params=request.device_params,
                power_target=power_level,
            )

            recommendations.append({
                "power": power_level,
                "phi_optimal": result["phi_optimal"],
                "deadtime_optimal": result.get("deadtime_optimal", request.device_params.get("deadtime", 200e-9)),
                "zvs_margin": result.get("zvs_margin", 0.0),
                "efficiency": result.get("efficiency", 0.0),
            })

        return {
            "recommendations": recommendations,
            "metadata": {
                "vin": request.vin,
                "vout": request.vout,
                "fsw": request.fsw,
                "llk": request.llk,
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"ZVS optimization failed: {str(e)}"
        )


@router.get("/run/{run_id}/map")
async def get_run_zvs_map(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Get ZVS map from a completed simulation run."""
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found"
        )

    # Check org ownership
    project = db.query(Project).filter(Project.id == run.project_id).first()
    if not project or project.org_id != org.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this run"
        )

    if not run.results_json or "zvs_map" not in run.results_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ZVS map not found in run results"
        )

    return run.results_json["zvs_map"]
