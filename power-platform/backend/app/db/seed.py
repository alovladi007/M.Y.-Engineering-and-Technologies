"""Database seed script - creates demo data."""
from datetime import datetime
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models import (
    User, Org, Member, Project, Run,
    RunStatus, UserRole
)


def seed_database():
    """Create demo organization, users, and projects."""
    db = SessionLocal()

    try:
        print("🌱 Seeding database...")

        # Create demo user
        demo_user = User(
            email="demo@powerplatform.io",
            name="Demo User",
            provider="demo",
            role=UserRole.ENGINEER
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        print(f"✓ Created demo user: {demo_user.email}")

        # Create demo organization
        demo_org = Org(
            name="Demo Organization",
            meta={"description": "Demo organization for Power Platform"}
        )
        db.add(demo_org)
        db.commit()
        db.refresh(demo_org)
        print(f"✓ Created organization: {demo_org.name}")

        # Add user to organization
        member = Member(
            user_id=demo_user.id,
            org_id=demo_org.id,
            role=UserRole.ENGINEER
        )
        db.add(member)
        db.commit()
        print(f"✓ Added user to organization")

        # Create demo project
        demo_project = Project(
            org_id=demo_org.id,
            name="EV Charger Design",
            description="50kW DC fast charger with bidirectional capability"
        )
        db.add(demo_project)
        db.commit()
        db.refresh(demo_project)
        print(f"✓ Created project: {demo_project.name}")

        # Create sample run
        demo_run = Run(
            project_id=demo_project.id,
            topology="dab_single",
            params_json={
                "vin": 800,
                "vout": 400,
                "power": 50000,
                "fsw": 100000,
                "llk": 0.00001,
                "n": 2.0,
                "phi": 45,
                "cdc_in": 0.0001,
                "cdc_out": 0.0001,
                "deadtime": 0.0000001
            },
            status=RunStatus.COMPLETED,
            results_json={
                "topology": "DAB_Single_Phase",
                "results": {
                    "efficiency": 96.5,
                    "thd_current": 3.2,
                    "power_factor": 0.98,
                    "i_rms": 62.5,
                    "i_peak": 88.4
                },
                "losses": {
                    "primary_switches": 850,
                    "secondary_switches": 650,
                    "transformer": 250,
                    "total_loss": 1750,
                    "junction_temp_pri": 95.2,
                    "junction_temp_sec": 92.1,
                    "thermal_safe": True
                }
            },
            started_at=datetime.utcnow(),
            finished_at=datetime.utcnow()
        )
        db.add(demo_run)
        db.commit()
        db.refresh(demo_run)
        print(f"✓ Created sample run: {demo_run.topology} (ID: {demo_run.id})")

        print("\n🎉 Database seeded successfully!")
        print(f"\nDemo credentials:")
        print(f"  Email: {demo_user.email}")
        print(f"  Organization: {demo_org.name}")
        print(f"  Project: {demo_project.name}")
        print(f"  Sample Run ID: {demo_run.id}")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
