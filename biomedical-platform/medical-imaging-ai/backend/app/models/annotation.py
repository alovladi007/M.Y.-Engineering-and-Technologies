"""
Annotation Model
Stores radiologist annotations for training and validation
"""

from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Float, Integer, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class Annotation(Base):
    """Radiologist annotations for medical images"""

    __tablename__ = "annotations"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign Key
    image_id = Column(UUID(as_uuid=True), ForeignKey("medical_images.id"), nullable=False, index=True)

    # Annotator Information
    annotator_id = Column(String(64), nullable=False, index=True)
    annotator_role = Column(String(32))  # radiologist, resident, AI
    annotator_experience_years = Column(Integer)

    # Annotation Type
    annotation_type = Column(
        String(32),
        nullable=False,
        index=True,
    )  # classification, segmentation, detection, measurement

    # Classification Annotations
    diagnosis = Column(String(128), index=True)
    diagnosis_confidence = Column(Float)  # 0.0 to 1.0

    # Multi-label Classification
    labels = Column(JSONB)
    # Format: [
    #   {"label": "pneumonia", "confidence": 0.95},
    #   {"label": "consolidation", "confidence": 0.85}
    # ]

    # Segmentation Data
    segmentation_mask_path = Column(String(512))
    segmentation_mask_s3_key = Column(String(512))
    segmentation_format = Column(String(16))  # nifti, png, numpy

    # Bounding Boxes (for detection)
    bounding_boxes = Column(JSONB)
    # Format: [
    #   {
    #     "class": "nodule",
    #     "x": 100, "y": 150, "width": 50, "height": 50,
    #     "confidence": 0.9
    #   }
    # ]

    # Measurements
    measurements = Column(JSONB)
    # Format: {
    #   "lesion_size_mm": 25.5,
    #   "hu_value": 45,
    #   "volume_cm3": 2.3
    # }

    # Clinical Notes
    clinical_notes = Column(Text)
    findings = Column(Text)
    impression = Column(Text)

    # Severity Assessment
    severity = Column(String(16))  # normal, mild, moderate, severe, critical
    urgency = Column(String(16))  # routine, urgent, emergent

    # Quality Assessment
    image_quality = Column(String(16))  # excellent, good, acceptable, poor
    quality_issues = Column(JSONB)
    # Format: ["motion artifact", "low contrast", "noise"]

    # Follow-up Recommendations
    recommendations = Column(JSONB)
    # Format: [
    #   {"action": "CT scan", "timeframe": "3 months"},
    #   {"action": "Biopsy", "priority": "urgent"}
    # ]

    # Annotation Status
    status = Column(
        String(32),
        nullable=False,
        default="draft",
        index=True,
    )  # draft, submitted, reviewed, approved, rejected

    # Validation
    validated_by = Column(String(64))
    validated_at = Column(DateTime)
    validation_score = Column(Float)

    # Disagreement/Consensus
    is_consensus = Column(String(16), default="no")  # yes, no
    consensus_round = Column(Integer)
    disagreement_notes = Column(Text)

    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    submitted_at = Column(DateTime)

    # Time tracking
    annotation_duration_seconds = Column(Integer)

    # Relationships
    image = relationship("MedicalImage", back_populates="annotations")

    # Indexes
    __table_args__ = (
        Index("idx_annotator_date", "annotator_id", "created_at"),
        Index("idx_diagnosis_confidence", "diagnosis", "diagnosis_confidence"),
        Index("idx_status_urgency", "status", "urgency"),
    )

    def __repr__(self) -> str:
        return f"<Annotation(id={self.id}, diagnosis={self.diagnosis}, annotator={self.annotator_id})>"
