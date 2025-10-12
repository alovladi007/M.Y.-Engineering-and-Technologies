"""
Compliance checking API routes.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.db.session import get_db
from app.db.models import User, Run, Project, ComplianceReport
from app.deps import get_current_user, get_current_org
from app.services.compliance.rules_engine import RulesEngine
from pydantic import BaseModel

router = APIRouter(prefix="/compliance", tags=["compliance"])

# Initialize rules engine
rules_engine = RulesEngine()


class ComplianceCheckRequest(BaseModel):
    run_id: int
    rulesets: List[str]  # e.g., ["ieee_1547", "ul_1741", "iec_61000"]


class RuleResult(BaseModel):
    rule_name: str
    description: str
    passed: bool
    measured: float | None = None
    limit: float | None = None
    margin: float | None = None
    unit: str = ""


class ComplianceCheckResponse(BaseModel):
    report_id: int
    run_id: int
    ruleset: str
    overall_passed: bool
    rules: List[RuleResult]
    timestamp: datetime


@router.get("/rulesets")
async def list_rulesets(
    current_user: User = Depends(get_current_user),
):
    """List available compliance rulesets."""
    rulesets = rules_engine.list_rulesets()
    return {"rulesets": rulesets}


@router.get("/rulesets/{ruleset_name}")
async def get_ruleset_details(
    ruleset_name: str,
    current_user: User = Depends(get_current_user),
):
    """Get details of a specific ruleset."""
    try:
        details = rules_engine.get_ruleset_info(ruleset_name)
        return details
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )


@router.post("/check", response_model=List[ComplianceCheckResponse])
async def check_compliance(
    request: ComplianceCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Check simulation run against compliance rulesets."""
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
            detail="Not authorized to check compliance for this run"
        )

    if not run.results_json:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Run has no results to check"
        )

    results = []

    for ruleset_name in request.rulesets:
        try:
            # Evaluate ruleset
            compliance_result = rules_engine.evaluate(
                ruleset_name=ruleset_name,
                simulation_results=run.results_json
            )

            # Convert to response format
            rule_results = [
                {
                    "rule_name": r["rule_name"],
                    "description": r["description"],
                    "passed": r["passed"],
                    "measured": r.get("measured"),
                    "limit": r.get("limit"),
                    "margin": r.get("margin"),
                    "unit": r.get("unit", ""),
                }
                for r in compliance_result["rules"]
            ]

            # Save report to database
            report = ComplianceReport(
                run_id=run.id,
                ruleset=ruleset_name,
                overall_passed=compliance_result["overall_passed"],
                results_json={
                    "rules": rule_results,
                    "summary": compliance_result.get("summary", {}),
                },
            )
            db.add(report)
            db.flush()

            results.append({
                "report_id": report.id,
                "run_id": run.id,
                "ruleset": ruleset_name,
                "overall_passed": compliance_result["overall_passed"],
                "rules": rule_results,
                "timestamp": report.created_at,
            })

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Compliance check failed for {ruleset_name}: {str(e)}"
            )

    db.commit()

    return results


@router.get("/reports/{report_id}", response_model=ComplianceCheckResponse)
async def get_compliance_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Get compliance report by ID."""
    report = db.query(ComplianceReport).filter(ComplianceReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    # Check org ownership
    run = db.query(Run).filter(Run.id == report.run_id).first()
    if run:
        project = db.query(Project).filter(Project.id == run.project_id).first()
        if not project or project.org_id != org.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this report"
            )

    return {
        "report_id": report.id,
        "run_id": report.run_id,
        "ruleset": report.ruleset,
        "overall_passed": report.overall_passed,
        "rules": report.results_json.get("rules", []),
        "timestamp": report.created_at,
    }


@router.get("/run/{run_id}/reports", response_model=List[ComplianceCheckResponse])
async def get_run_reports(
    run_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Get all compliance reports for a run."""
    # Verify run exists and user has access
    run = db.query(Run).filter(Run.id == run_id).first()
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Run not found"
        )

    project = db.query(Project).filter(Project.id == run.project_id).first()
    if not project or project.org_id != org.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view reports for this run"
        )

    reports = db.query(ComplianceReport).filter(
        ComplianceReport.run_id == run_id
    ).all()

    return [
        {
            "report_id": r.id,
            "run_id": r.run_id,
            "ruleset": r.ruleset,
            "overall_passed": r.overall_passed,
            "rules": r.results_json.get("rules", []),
            "timestamp": r.created_at,
        }
        for r in reports
    ]


@router.delete("/reports/{report_id}")
async def delete_compliance_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    org = Depends(get_current_org),
):
    """Delete compliance report."""
    report = db.query(ComplianceReport).filter(ComplianceReport.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    # Check org ownership
    run = db.query(Run).filter(Run.id == report.run_id).first()
    if run:
        project = db.query(Project).filter(Project.id == run.project_id).first()
        if not project or project.org_id != org.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this report"
            )

    db.delete(report)
    db.commit()

    return {"message": "Report deleted successfully"}
