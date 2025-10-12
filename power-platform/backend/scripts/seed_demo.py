#!/usr/bin/env python3
"""
Database seeding script for Power Platform demo environment.

This script creates:
- Demo user (Vladimir Antoine)
- Demo organization (M.Y. Engineering & Technologies)
- Sample project (Power Platform Demo)
- Sample simulation run with results
- Sample PDF report artifact
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from datetime import datetime
from app.db.session import SessionLocal
from app.db.models import User, Org, Project, Run, RunStatus, Artifact
from app.config import get_settings

settings = get_settings()


def seed_database():
    """Seed the database with demo data."""
    db = SessionLocal()

    try:
        print("🌱 Seeding Power Platform database...")

        # 1. Create demo user
        print("Creating demo user...")
        user = db.query(User).filter(User.email == "vladimir@myengineering.tech").first()
        if not user:
            user = User(
                email="vladimir@myengineering.tech",
                name="Vladimir Antoine",
                role="admin"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"✓ Created user: {user.name} (ID: {user.id})")
        else:
            print(f"✓ User already exists: {user.name} (ID: {user.id})")

        # 2. Create demo organization
        print("Creating demo organization...")
        org = db.query(Org).filter(Org.name == "M.Y. Engineering & Technologies").first()
        if not org:
            org = Org(
                name="M.Y. Engineering & Technologies"
            )
            db.add(org)
            db.commit()
            db.refresh(org)
            print(f"✓ Created organization: {org.name} (ID: {org.id})")
        else:
            print(f"✓ Organization already exists: {org.name} (ID: {org.id})")

        # 3. Create demo project
        print("Creating demo project...")
        project = db.query(Project).filter(
            Project.org_id == org.id,
            Project.name == "Power Platform Demo Project"
        ).first()

        if not project:
            project = Project(
                name="Power Platform Demo Project",
                org_id=org.id,
                description="Demonstration project showcasing Power Platform capabilities for DAB converter simulation"
            )
            db.add(project)
            db.commit()
            db.refresh(project)
            print(f"✓ Created project: {project.name} (ID: {project.id})")
        else:
            print(f"✓ Project already exists: {project.name} (ID: {project.id})")

        # 4. Create sample simulation run with results
        print("Creating sample simulation run...")
        run = db.query(Run).filter(Run.project_id == project.id).first()

        if not run:
            run = Run(
                project_id=project.id,
                topology="dab_single",
                params_json={
                    "vin": 400.0,
                    "vout": 400.0,
                    "pout": 10000.0,
                    "fsw": 100000.0,
                    "n": 1.0,
                    "llk": 10e-6,
                    "deadtime": 100e-9,
                    "phi_deg": 15.0
                },
                status=RunStatus.COMPLETED,
                started_at=datetime.utcnow(),
                finished_at=datetime.utcnow(),
                results_json={
                    "topology": "dab_single",
                    "params": {
                        "vin": 400.0,
                        "vout": 400.0,
                        "pout": 10000.0,
                        "fsw": 100000.0
                    },
                    "results": {
                        "power_transfer": 10000.0,
                        "efficiency": 0.955,
                        "i_rms_pri": 25.5,
                        "i_rms_sec": 25.5,
                        "i_peak": 35.2,
                        "p_cond_total": 325.0,
                        "p_sw_total": 145.0,
                        "p_loss_total": 470.0,
                        "thd": 0.028
                    },
                    "waveforms": {
                        "time": [i * 1e-7 for i in range(100)],
                        "v_pri": [400 if i % 50 < 25 else -400 for i in range(100)],
                        "i_pri": [25.0 + 10.0 * (i % 50) / 50 for i in range(100)],
                        "v_sec": [400 if i % 50 >= 10 else -400 for i in range(100)],
                        "i_sec": [25.0 + 10.0 * (i % 50) / 50 for i in range(100)]
                    },
                    "zvs_analysis": {
                        "boundary": {
                            "zvs_achieved": True,
                            "margin": 45.2,
                            "e_ind": 1.25e-3,
                            "e_cap": 0.75e-3
                        }
                    }
                }
            )
            db.add(run)
            db.commit()
            db.refresh(run)
            print(f"✓ Created simulation run (ID: {run.id})")
            print(f"  - Topology: {run.topology}")
            print(f"  - Status: {run.status.value}")
            print(f"  - Efficiency: {run.results_json['results']['efficiency'] * 100:.1f}%")
            print(f"  - Power: {run.results_json['results']['power_transfer'] / 1000:.1f} kW")
        else:
            print(f"✓ Simulation run already exists (ID: {run.id})")

        # 5. Create sample artifact (placeholder for PDF)
        print("Creating sample artifact...")
        artifact = db.query(Artifact).filter(Artifact.run_id == run.id).first()

        if not artifact:
            artifact = Artifact(
                run_id=run.id,
                type="json",
                path=f"/app/static/exports/run_{run.id}_results.json",
                meta={
                    "description": "Simulation results JSON",
                    "generated_at": datetime.utcnow().isoformat()
                }
            )
            db.add(artifact)
            db.commit()
            print(f"✓ Created artifact (ID: {artifact.id})")
        else:
            print(f"✓ Artifact already exists (ID: {artifact.id})")

        print("\n✅ Database seeding completed successfully!")
        print("\n📊 Summary:")
        print(f"   User: {user.email}")
        print(f"   Organization: {org.name}")
        print(f"   Project: {project.name}")
        print(f"   Simulation Runs: {db.query(Run).filter(Run.project_id == project.id).count()}")
        print(f"   Artifacts: {db.query(Artifact).filter(Artifact.run_id == run.id).count()}")
        print("\n🚀 You can now login with demo credentials at http://localhost:3001")

    except Exception as e:
        print(f"\n❌ Error seeding database: {e}")
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
