"""Database models."""
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean, Column, DateTime, ForeignKey, Integer,
    JSON, String, Text, Float, Enum as SQLEnum
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()


class UserRole(str, enum.Enum):
    """User roles."""
    ADMIN = "admin"
    ENGINEER = "engineer"
    VIEWER = "viewer"


class RunStatus(str, enum.Enum):
    """Run status."""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class User(Base):
    """User model."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255))
    provider = Column(String(50))  # google, github
    role = Column(SQLEnum(UserRole), default=UserRole.ENGINEER)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    memberships = relationship("Member", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Org(Base):
    """Organization model."""
    __tablename__ = "orgs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    meta = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = relationship("Member", back_populates="org")
    projects = relationship("Project", back_populates="org")
    devices = relationship("Device", back_populates="org")
    audit_logs = relationship("AuditLog", back_populates="org")


class Member(Base):
    """Organization membership."""
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    org_id = Column(Integer, ForeignKey("orgs.id"), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.ENGINEER)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="memberships")
    org = relationship("Org", back_populates="members")


class Project(Base):
    """Project model."""
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("orgs.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    meta = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    org = relationship("Org", back_populates="projects")
    runs = relationship("Run", back_populates="project")


class Run(Base):
    """Simulation run model."""
    __tablename__ = "runs"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    status = Column(SQLEnum(RunStatus), default=RunStatus.PENDING)
    topology = Column(String(100), nullable=False)
    params_json = Column(JSON, nullable=False)
    results_json = Column(JSON, default={})
    started_at = Column(DateTime)
    finished_at = Column(DateTime)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship("Project", back_populates="runs")
    artifacts = relationship("Artifact", back_populates="run")
    compliance_reports = relationship("ComplianceReport", back_populates="run")


class Artifact(Base):
    """Artifact model."""
    __tablename__ = "artifacts"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("runs.id"), nullable=False)
    type = Column(String(50), nullable=False)  # pdf, csv, json, png
    path = Column(String(500), nullable=False)
    meta = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

    run = relationship("Run", back_populates="artifacts")


class Device(Base):
    """Device library model."""
    __tablename__ = "devices"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("orgs.id"), nullable=False)
    name = Column(String(255), nullable=False)
    manufacturer = Column(String(255))
    technology = Column(String(50))  # Si, SiC, GaN
    vds_max = Column(Float)
    id_max = Column(Float)
    rds_on_25c = Column(Float)
    rds_on_125c = Column(Float)
    qgs = Column(Float)
    qgd = Column(Float)
    eon = Column(Float)
    eoff = Column(Float)
    vf_diode = Column(Float)
    tj_max = Column(Float)
    rth_jc = Column(Float)
    rth_ja = Column(Float)
    meta = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

    org = relationship("Org", back_populates="devices")


class ComplianceReport(Base):
    """Compliance report model."""
    __tablename__ = "compliance_reports"

    id = Column(Integer, primary_key=True, index=True)
    run_id = Column(Integer, ForeignKey("runs.id"), nullable=False)
    ruleset = Column(String(100), nullable=False)
    result_json = Column(JSON, nullable=False)
    pdf_path = Column(String(500))
    passed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    run = relationship("Run", back_populates="compliance_reports")


class AuditLog(Base):
    """Audit log model."""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    org_id = Column(Integer, ForeignKey("orgs.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)
    payload = Column(JSON, default={})
    timestamp = Column(DateTime, default=datetime.utcnow)

    org = relationship("Org", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")
