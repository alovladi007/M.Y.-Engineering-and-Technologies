"""
Medical Study Model
Represents a DICOM study (collection of series/images)
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Study(Base):
    """Medical study model"""

    __tablename__ = "studies"

    # Primary Key (using DICOM Study Instance UID)
    study_instance_uid = Column(String(64), primary_key=True, index=True)

    # Internal ID
    id = Column(UUID(as_uuid=True), unique=True, nullable=False, default=uuid.uuid4)

    # Patient Information (de-identified)
    patient_id = Column(String(64), nullable=False, index=True)
    patient_age = Column(Integer)
    patient_sex = Column(String(1))

    # Study Information
    study_date = Column(DateTime, index=True)
    study_time = Column(String(32))
    study_description = Column(Text)
    accession_number = Column(String(64), index=True)

    # Referring Physician (de-identified)
    referring_physician = Column(String(64))

    # Study Status
    status = Column(
        String(32),
        nullable=False,
        default="pending",
        index=True,
    )  # pending, processing, completed, failed

    # Statistics
    num_series = Column(Integer, default=0)
    num_images = Column(Integer, default=0)

    # Priority
    priority = Column(
        String(16),
        default="routine",
        index=True,
    )  # stat, urgent, routine

    # Clinical Indication
    clinical_indication = Column(Text)

    # Additional Metadata
    metadata = Column(JSONB)

    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    images = relationship("MedicalImage", back_populates="study", cascade="all, delete-orphan")
    inference_results = relationship("InferenceResult", back_populates="study")

    # Indexes
    __table_args__ = (
        Index("idx_patient_study_date", "patient_id", "study_date"),
        Index("idx_status_priority", "status", "priority"),
    )

    def __repr__(self) -> str:
        return f"<Study(study_instance_uid={self.study_instance_uid}, patient_id={self.patient_id})>"
