"""
Device library API routes.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
import shutil
from pathlib import Path

from app.db.session import get_db
from app.db.models import User, Device as DeviceModel
from app.deps import get_current_user, get_current_org
from app.services.sim.devices.library import DeviceLibrary, DeviceSpec
from pydantic import BaseModel

router = APIRouter(prefix="/devices", tags=["devices"])

# Initialize device library
device_lib = DeviceLibrary()


class DeviceResponse(BaseModel):
    name: str
    manufacturer: str
    technology: str
    vds_max: float
    id_max: float
    rds_on_25c: float
    rds_on_125c: float
    qgs: float
    qgd: float
    eon: float
    eoff: float
    vf_diode: float
    tj_max: float
    rth_jc: float
    rth_ja: float
    coss: float


class DeviceSearchRequest(BaseModel):
    technology: Optional[str] = None
    vds_min: Optional[float] = None
    vds_max: Optional[float] = None
    id_min: Optional[float] = None
    id_max: Optional[float] = None
    rds_on_max: Optional[float] = None


class DeviceRecommendRequest(BaseModel):
    voltage_stress: float
    current_stress: float
    technology: Optional[str] = None
    derating_voltage: float = 0.8
    derating_current: float = 0.7


@router.get("/list", response_model=List[DeviceResponse])
async def list_devices(
    technology: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
):
    """List all available devices."""
    devices = device_lib.list_all()

    if technology:
        devices = [d for d in devices if d.technology.lower() == technology.lower()]

    devices = devices[skip:skip + limit]

    return [
        {
            "name": d.name,
            "manufacturer": d.manufacturer,
            "technology": d.technology,
            "vds_max": d.vds_max,
            "id_max": d.id_max,
            "rds_on_25c": d.rds_on_25c,
            "rds_on_125c": d.rds_on_125c,
            "qgs": d.qgs,
            "qgd": d.qgd,
            "eon": d.eon,
            "eoff": d.eoff,
            "vf_diode": d.vf_diode,
            "tj_max": d.tj_max,
            "rth_jc": d.rth_jc,
            "rth_ja": d.rth_ja,
            "coss": d.coss,
        }
        for d in devices
    ]


@router.get("/get/{device_name}", response_model=DeviceResponse)
async def get_device(
    device_name: str,
    current_user: User = Depends(get_current_user),
):
    """Get device specifications by name."""
    try:
        device = device_lib.get_device(device_name)
        return {
            "name": device.name,
            "manufacturer": device.manufacturer,
            "technology": device.technology,
            "vds_max": device.vds_max,
            "id_max": device.id_max,
            "rds_on_25c": device.rds_on_25c,
            "rds_on_125c": device.rds_on_125c,
            "qgs": device.qgs,
            "qgd": device.qgd,
            "eon": device.eon,
            "eoff": device.eoff,
            "vf_diode": device.vf_diode,
            "tj_max": device.tj_max,
            "rth_jc": device.rth_jc,
            "rth_ja": device.rth_ja,
            "coss": device.coss,
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/search", response_model=List[DeviceResponse])
async def search_devices(
    request: DeviceSearchRequest,
    current_user: User = Depends(get_current_user),
):
    """Search devices by specifications."""
    devices = device_lib.search(
        technology=request.technology,
        vds_min=request.vds_min,
        vds_max=request.vds_max,
        id_min=request.id_min,
        id_max=request.id_max,
        rds_on_max=request.rds_on_max,
    )

    return [
        {
            "name": d.name,
            "manufacturer": d.manufacturer,
            "technology": d.technology,
            "vds_max": d.vds_max,
            "id_max": d.id_max,
            "rds_on_25c": d.rds_on_25c,
            "rds_on_125c": d.rds_on_125c,
            "qgs": d.qgs,
            "qgd": d.qgd,
            "eon": d.eon,
            "eoff": d.eoff,
            "vf_diode": d.vf_diode,
            "tj_max": d.tj_max,
            "rth_jc": d.rth_jc,
            "rth_ja": d.rth_ja,
            "coss": d.coss,
        }
        for d in devices
    ]


@router.post("/recommend", response_model=List[DeviceResponse])
async def recommend_devices(
    request: DeviceRecommendRequest,
    current_user: User = Depends(get_current_user),
):
    """Recommend devices for given voltage and current stress."""
    devices = device_lib.recommend_device(
        voltage_stress=request.voltage_stress,
        current_stress=request.current_stress,
        technology=request.technology,
        derating_voltage=request.derating_voltage,
        derating_current=request.derating_current,
    )

    return [
        {
            "name": d.name,
            "manufacturer": d.manufacturer,
            "technology": d.technology,
            "vds_max": d.vds_max,
            "id_max": d.id_max,
            "rds_on_25c": d.rds_on_25c,
            "rds_on_125c": d.rds_on_125c,
            "qgs": d.qgs,
            "qgd": d.qgd,
            "eon": d.eon,
            "eoff": d.eoff,
            "vf_diode": d.vf_diode,
            "tj_max": d.tj_max,
            "rth_jc": d.rth_jc,
            "rth_ja": d.rth_ja,
            "coss": d.coss,
        }
        for d in devices
    ]


@router.post("/upload")
async def upload_device_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Upload custom device CSV file."""
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV"
        )

    # Save to organization-specific location
    org_device_dir = Path(f"data/devices/org_{org.id}")
    org_device_dir.mkdir(parents=True, exist_ok=True)

    csv_path = org_device_dir / file.filename

    with open(csv_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Load the new CSV into the library
    try:
        device_lib.load_csv(str(csv_path))

        # Store reference in database
        device_record = DeviceModel(
            org_id=org.id,
            name=file.filename,
            csv_path=str(csv_path),
        )
        db.add(device_record)
        db.commit()

        return {
            "message": "Device CSV uploaded successfully",
            "filename": file.filename,
            "devices_loaded": len(device_lib.list_all()),
        }

    except Exception as e:
        csv_path.unlink(missing_ok=True)  # Clean up on error
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse CSV: {str(e)}"
        )


@router.get("/technologies")
async def list_technologies(
    current_user: User = Depends(get_current_user),
):
    """List all available device technologies."""
    devices = device_lib.list_all()
    technologies = list(set(d.technology for d in devices))
    return {"technologies": sorted(technologies)}
