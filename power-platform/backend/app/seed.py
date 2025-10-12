"""Seed database with demo data for testing."""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from datetime import datetime
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models import User, Org, Member, Project, Run, RunStatus, UserRole
from app.config import get_settings

settings = get_settings()


def seed_demo_data():
    """Create demo user, org, project, and sample simulation run."""
    db: Session = SessionLocal()

    try:
        print("🌱 Seeding demo data...")

        # 1. Create demo user
        demo_user = db.query(User).filter(User.email == "demo@power-platform.local").first()
        if not demo_user:
            demo_user = User(
                email="demo@power-platform.local",
                name="Demo User",
                provider="demo",
                role=UserRole.ENGINEER
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print(f"✅ Created demo user: {demo_user.email}")
        else:
            print(f"✓ Demo user already exists: {demo_user.email}")

        # 2. Create demo organization
        demo_org = db.query(Org).filter(Org.name == "Demo Organization").first()
        if not demo_org:
            demo_org = Org(
                name="Demo Organization",
                meta={"description": "Demo organization for testing"}
            )
            db.add(demo_org)
            db.commit()
            db.refresh(demo_org)
            print(f"✅ Created demo org: {demo_org.name}")
        else:
            print(f"✓ Demo org already exists: {demo_org.name}")

        # 3. Create membership
        member = db.query(Member).filter(
            Member.user_id == demo_user.id,
            Member.org_id == demo_org.id
        ).first()
        if not member:
            member = Member(
                user_id=demo_user.id,
                org_id=demo_org.id,
                role=UserRole.ADMIN
            )
            db.add(member)
            db.commit()
            print(f"✅ Created membership for user in org")
        else:
            print(f"✓ Membership already exists")

        # 4. Create demo project
        demo_project = db.query(Project).filter(
            Project.org_id == demo_org.id,
            Project.name == "Demo DAB Converter"
        ).first()
        if not demo_project:
            demo_project = Project(
                org_id=demo_org.id,
                name="Demo DAB Converter",
                description="Sample Dual Active Bridge converter for 400V to 800V DC-DC conversion",
                meta={
                    "application": "EV Charging",
                    "power_rating": "5kW",
                    "topology": "dab_single"
                }
            )
            db.add(demo_project)
            db.commit()
            db.refresh(demo_project)
            print(f"✅ Created demo project: {demo_project.name}")
        else:
            print(f"✓ Demo project already exists: {demo_project.name}")

        # 5. Create sample simulation run (completed)
        existing_run = db.query(Run).filter(
            Run.project_id == demo_project.id
        ).first()

        if not existing_run:
            sample_run = Run(
                project_id=demo_project.id,
                status=RunStatus.COMPLETED,
                topology="dab_single",
                params_json={
                    "vin": 400,
                    "vout": 800,
                    "pout": 5000,
                    "fsw": 100000,
                    "llk": 50e-6,
                    "n": 1.0,
                    "phi_deg": 20,
                    "cdc_in": 100e-6,
                    "cdc_out": 50e-6,
                    "deadtime": 200e-9
                },
                results_json={
                    "efficiency": 96.8,
                    "thd_in": 2.1,
                    "thd_out": 1.5,
                    "pf_in": 0.99,
                    "i_rms_pri": 12.8,
                    "i_rms_sec": 6.4,
                    "v_dc_in": 400.0,
                    "v_dc_out": 800.0,
                    "p_out": 5000.0,
                    "p_loss_total": 165.0,
                    "zvs_primary": True,
                    "zvs_secondary": True,
                    "status": "Simulation completed successfully"
                },
                started_at=datetime.utcnow(),
                finished_at=datetime.utcnow()
            )
            db.add(sample_run)
            db.commit()
            db.refresh(sample_run)
            print(f"✅ Created sample simulation run (ID: {sample_run.id})")
            print(f"   Topology: {sample_run.topology}")
            print(f"   Efficiency: {sample_run.results_json['efficiency']}%")
            print(f"   Status: {sample_run.status.value}")
        else:
            print(f"✓ Sample run already exists (ID: {existing_run.id})")

        print("\n🎉 Demo data seeding complete!")
        print("\nDemo credentials:")
        print(f"  Email: {demo_user.email}")
        print(f"  Org: {demo_org.name}")
        print(f"  Project: {demo_project.name}")
        print(f"\nAPI Demo Login:")
        print(f"  curl -X POST http://localhost:8080/api/auth/demo")

    except Exception as e:
        print(f"❌ Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
