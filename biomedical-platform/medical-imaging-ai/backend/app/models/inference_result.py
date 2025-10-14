"""
Inference Result Model
Stores ML model predictions and Grad-CAM visualizations
"""

from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Text, Integer, Index
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base


class InferenceResult(Base):
    """ML inference result with Grad-CAM visualization"""

    __tablename__ = "inference_results"

    # Primary Key
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign Keys
    image_id = Column(UUID(as_uuid=True), ForeignKey("medical_images.id"), nullable=False, index=True)
    study_instance_uid = Column(String(64), ForeignKey("studies.study_instance_uid"), nullable=False, index=True)

    # Model Information
    model_name = Column(String(64), nullable=False, index=True)  # resnet50, efficientnet, etc.
    model_version = Column(String(32), nullable=False)
    model_checkpoint = Column(String(128))

    # Inference Metadata
    inference_time = Column(Float)  # seconds
    gpu_used = Column(String(32))
    batch_size = Column(Integer, default=1)

    # Predictions
    predictions = Column(JSONB, nullable=False)
    # Format: {
    #   "classes": ["pneumonia", "covid19", "normal"],
    #   "probabilities": [0.85, 0.10, 0.05],
    #   "top_prediction": "pneumonia",
    #   "confidence": 0.85
    # }

    # Classification Results
    predicted_class = Column(String(128), nullable=False, index=True)
    confidence_score = Column(Float, nullable=False)
    is_high_confidence = Column(
        String(16),
        default="medium",
    )  # high (>0.9), medium (0.7-0.9), low (<0.7)

    # Multi-label Classification (if applicable)
    predicted_labels = Column(JSONB)
    # Format: [
    #   {"label": "pneumonia", "probability": 0.85},
    #   {"label": "pleural_effusion", "probability": 0.45}
    # ]

    # Grad-CAM Visualization
    gradcam_s3_key = Column(String(512))
    gradcam_local_path = Column(String(512))
    gradcam_layer = Column(String(64))  # Layer used for Grad-CAM
    heatmap_quality = Column(Float)  # Quality score of heatmap

    # Attention Regions (bounding boxes of high activation)
    attention_regions = Column(JSONB)
    # Format: [
    #   {"x": 100, "y": 150, "width": 50, "height": 50, "activation": 0.95},
    #   {"x": 200, "y": 250, "width": 60, "height": 60, "activation": 0.88}
    # ]

    # Additional Visualizations
    overlays = Column(JSONB)
    # Format: {
    #   "original_with_heatmap": "s3://bucket/path/overlay.png",
    #   "segmentation_mask": "s3://bucket/path/mask.png"
    # }

    # Uncertainty Quantification
    epistemic_uncertainty = Column(Float)  # Model uncertainty
    aleatoric_uncertainty = Column(Float)  # Data uncertainty
    prediction_entropy = Column(Float)

    # Clinical Findings (extracted from prediction)
    findings = Column(JSONB)
    # Format: {
    #   "abnormalities": ["mass in right upper lobe", "pleural effusion"],
    #   "severity": "moderate",
    #   "recommendations": ["follow-up CT in 3 months", "consult pulmonologist"]
    # }

    # Triage Priority
    triage_priority = Column(
        String(16),
        index=True,
    )  # critical, urgent, routine, normal
    requires_radiologist_review = Column(String(16), default="no")  # yes, no, maybe

    # Status
    status = Column(
        String(32),
        nullable=False,
        default="completed",
    )  # completed, failed, pending_review

    # Review Status
    reviewed_by = Column(String(64))  # Radiologist ID
    reviewed_at = Column(DateTime)
    radiologist_feedback = Column(Text)
    is_correct = Column(String(16))  # yes, no, partially

    # Performance Metrics
    true_label = Column(String(128))  # Ground truth (if available)
    is_true_positive = Column(String(16))
    is_false_positive = Column(String(16))

    # Error/Exception Info
    error_message = Column(Text)
    stack_trace = Column(Text)

    # Timestamps
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    image = relationship("MedicalImage", back_populates="inference_results")
    study = relationship("Study", back_populates="inference_results")

    # Indexes
    __table_args__ = (
        Index("idx_model_confidence", "model_name", "confidence_score"),
        Index("idx_predicted_class_date", "predicted_class", "created_at"),
        Index("idx_triage_priority", "triage_priority", "created_at"),
        Index("idx_review_status", "requires_radiologist_review", "status"),
    )

    def __repr__(self) -> str:
        return (
            f"<InferenceResult(id={self.id}, "
            f"predicted_class={self.predicted_class}, "
            f"confidence={self.confidence_score:.2f})>"
        )
