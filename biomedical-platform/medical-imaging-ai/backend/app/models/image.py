"""
Medical Image Model
Represents DICOM images and metadata
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, JSON, DateTime, ForeignKey, Text, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class MedicalImage(Base):
    """Medical image model with DICOM metadata"""

    __tablename__ = "medical_images"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # DICOM Identifiers
    study_instance_uid = Column(String(64), ForeignKey("studies.study_instance_uid"), nullable=False, index=True)
    series_instance_uid = Column(String(64), nullable=False, index=True)
    sop_instance_uid = Column(String(64), unique=True, nullable=False, index=True)

    # Patient Information (de-identified)
    patient_id = Column(String(64), nullable=False, index=True)
    patient_age = Column(Integer)
    patient_sex = Column(String(1))

    # Image Metadata
    modality = Column(String(16), nullable=False, index=True)  # CT, MRI, X-Ray, etc.
    body_part = Column(String(64), index=True)
    image_orientation = Column(String(32))
    image_position = Column(String(128))

    # Image Properties
    rows = Column(Integer)
    columns = Column(Integer)
    pixel_spacing = Column(String(32))
    slice_thickness = Column(Float)
    bits_allocated = Column(Integer)
    bits_stored = Column(Integer)

    # Acquisition Information
    acquisition_date = Column(DateTime)
    acquisition_time = Column(String(32))
    manufacturer = Column(String(64))
    manufacturer_model = Column(String(64))
    institution_name = Column(String(64))

    # Storage
    file_path = Column(String(512), nullable=False)
    s3_key = Column(String(512))
    file_size = Column(Integer)
    file_hash = Column(String(64))  # SHA-256 hash

    # Processing Status
    status = Column(
        String(32),
        nullable=False,
        default="pending",
        index=True,
    )  # pending, processing, completed, failed
    processed_at = Column(DateTime)

    # Preprocessed Image
    preprocessed_path = Column(String(512))
    preprocessed_s3_key = Column(String(512))

    # Additional DICOM Tags (stored as JSON)
    dicom_tags = Column(JSONB)

    # Quality Metrics
    quality_score = Column(Float)
    quality_issues = Column(JSONB)

    # Anonymization
    is_anonymized = Column(Boolean, default=False)
    anonymized_at = Column(DateTime)

    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    study = relationship("Study", back_populates="images")
    annotations = relationship("Annotation", back_populates="image", cascade="all, delete-orphan")
    inference_results = relationship("InferenceResult", back_populates="image", cascade="all, delete-orphan")

    # Indexes
    __table_args__ = (
        Index("idx_patient_modality", "patient_id", "modality"),
        Index("idx_study_series", "study_instance_uid", "series_instance_uid"),
        Index("idx_acquisition_date", "acquisition_date"),
        Index("idx_status_created", "status", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<MedicalImage(id={self.id}, sop_instance_uid={self.sop_instance_uid}, modality={self.modality})>"
