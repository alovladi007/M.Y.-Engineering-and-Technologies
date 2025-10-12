"""
Report generation API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pathlib import Path

from app.db.session import get_db
from app.db.models import User, Run, Project, ComplianceReport, Artifact
from app.deps import get_current_user, get_current_org
from app.services.reporting.pdf import ReportGenerator
from pydantic import BaseModel

router = APIRouter(prefix="/reports", tags=["reports"])

# Report generator
report_gen = ReportGenerator()


class GenerateReportRequest(BaseModel):
    run_id: int
    compliance_report_ids: list[int] = []
    include_waveforms: bool = True
    include_zvs_map: bool = True
    include_compliance: bool = True


@router.post("/generate")
async def generate_report(
    request: GenerateReportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Generate PDF report for simulation run."""
    # Verify run exists and user has access
    run = db.query(Run).filter(Run.id == request.run_id).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found"
        )

    project = db.query(Project).filter(Project.id == run.project_id).first()
    if not project or project.org_id != org.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to generate report for this run"
        )

    if not run.results_json:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Run has no results to report"
        )

    # Gather compliance reports if requested
    compliance_results = []
    if request.include_compliance and request.compliance_report_ids:
        for report_id in request.compliance_report_ids:
            report = db.query(ComplianceReport).filter(
                ComplianceReport.id == report_id
            ).first()
            if report and report.run_id == request.run_id:
                compliance_results.append({
                    "ruleset": report.ruleset,
                    "overall_passed": report.overall_passed,
                    "rules": report.results_json.get("rules", []),
                })

    # Prepare metadata
    run_metadata = {
        "run_id": run.id,
        "project_name": project.name,
        "topology": run.topology,
        "started_at": run.started_at.isoformat() if run.started_at else None,
        "finished_at": run.finished_at.isoformat() if run.finished_at else None,
        "user_name": current_user.name,
        "org_name": org.name,
    }

    try:
        # Generate PDF
        output_dir = Path("backend/app/static/exports")
        output_dir.mkdir(parents=True, exist_ok=True)

        pdf_path = report_gen.generate_compliance_report(
            compliance_result=compliance_results[0] if compliance_results else None,
            simulation_results=run.results_json,
            run_metadata=run_metadata,
            output_path=str(output_dir / f"report_run_{run.id}.pdf"),
        )

        # Create artifact record
        artifact = Artifact(
            run_id=run.id,
            artifact_type="pdf_report",
            file_path=pdf_path,
        )
        db.add(artifact)
        db.commit()
        db.refresh(artifact)

        return {
            "message": "Report generated successfully",
            "artifact_id": artifact.id,
            "pdf_path": pdf_path,
            "download_url": f"/api/reports/download/{artifact.id}",
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation failed: {str(e)}"
        )


@router.get("/download/{artifact_id}")
async def download_report(
    artifact_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Download generated report PDF."""
    artifact = db.query(Artifact).filter(Artifact.id == artifact_id).first()
    if not artifact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Artifact not found"
        )

    # Check org ownership
    run = db.query(Run).filter(Run.id == artifact.run_id).first()
    if run:
        project = db.query(Project).filter(Project.id == run.project_id).first()
        if not project or project.org_id != org.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to download this report"
            )

    pdf_path = Path(artifact.file_path)
    if not pdf_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report file not found on disk"
        )

    return FileResponse(
        path=pdf_path,
        filename=pdf_path.name,
        media_type="application/pdf"
    )


@router.get("/templates")
async def list_report_templates(
    current_user: User = Depends(get_current_user),
):
    """List available report templates."""
    templates = [
        {
            "name": "standard",
            "description": "Standard simulation report with efficiency, losses, and waveforms",
        },
        {
            "name": "compliance",
            "description": "Compliance-focused report with pass/fail tables and margins",
        },
        {
            "name": "zvs_analysis",
            "description": "ZVS-focused report with feasibility maps and optimization",
        },
    ]

    return {"templates": templates}
