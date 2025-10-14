"""
DICOM Processing Service
Handles DICOM file parsing, validation, anonymization, and preprocessing
"""

import hashlib
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional, Tuple, Any
import structlog

import numpy as np
import pydicom
from pydicom.dataset import Dataset, FileDataset
from pydicom.uid import generate_uid
from PIL import Image

from app.core.config import settings

logger = structlog.get_logger()


class DICOMProcessor:
    """DICOM file processing and management"""

    def __init__(self):
        self.storage_path = Path(settings.DICOM_STORAGE_PATH)
        self.storage_path.mkdir(parents=True, exist_ok=True)

    async def read_dicom(self, file_path: str) -> FileDataset:
        """
        Read DICOM file

        Args:
            file_path: Path to DICOM file

        Returns:
            PyDICOM Dataset

        Raises:
            ValueError: If file is not a valid DICOM file
        """
        try:
            logger.info("reading_dicom_file", path=file_path)
            ds = pydicom.dcmread(file_path)
            logger.info("dicom_file_read", sop_instance_uid=str(ds.SOPInstanceUID))
            return ds
        except Exception as e:
            logger.error("failed_to_read_dicom", path=file_path, error=str(e))
            raise ValueError(f"Invalid DICOM file: {str(e)}")

    async def extract_metadata(self, ds: FileDataset) -> Dict[str, Any]:
        """
        Extract metadata from DICOM dataset

        Args:
            ds: PyDICOM Dataset

        Returns:
            Dictionary of metadata
        """
        metadata = {
            # DICOM Identifiers
            "study_instance_uid": str(ds.StudyInstanceUID) if hasattr(ds, "StudyInstanceUID") else None,
            "series_instance_uid": str(ds.SeriesInstanceUID) if hasattr(ds, "SeriesInstanceUID") else None,
            "sop_instance_uid": str(ds.SOPInstanceUID) if hasattr(ds, "SOPInstanceUID") else None,
            # Patient Information
            "patient_id": str(ds.PatientID) if hasattr(ds, "PatientID") else None,
            "patient_age": self._extract_age(ds),
            "patient_sex": str(ds.PatientSex) if hasattr(ds, "PatientSex") else None,
            # Image Metadata
            "modality": str(ds.Modality) if hasattr(ds, "Modality") else None,
            "body_part": str(ds.BodyPartExamined) if hasattr(ds, "BodyPartExamined") else None,
            "image_orientation": str(ds.ImageOrientationPatient) if hasattr(ds, "ImageOrientationPatient") else None,
            "image_position": str(ds.ImagePositionPatient) if hasattr(ds, "ImagePositionPatient") else None,
            # Image Properties
            "rows": int(ds.Rows) if hasattr(ds, "Rows") else None,
            "columns": int(ds.Columns) if hasattr(ds, "Columns") else None,
            "pixel_spacing": str(ds.PixelSpacing) if hasattr(ds, "PixelSpacing") else None,
            "slice_thickness": float(ds.SliceThickness) if hasattr(ds, "SliceThickness") else None,
            "bits_allocated": int(ds.BitsAllocated) if hasattr(ds, "BitsAllocated") else None,
            "bits_stored": int(ds.BitsStored) if hasattr(ds, "BitsStored") else None,
            # Acquisition Information
            "acquisition_date": self._parse_dicom_date(ds.AcquisitionDate) if hasattr(ds, "AcquisitionDate") else None,
            "acquisition_time": str(ds.AcquisitionTime) if hasattr(ds, "AcquisitionTime") else None,
            "manufacturer": str(ds.Manufacturer) if hasattr(ds, "Manufacturer") else None,
            "manufacturer_model": str(ds.ManufacturerModelName) if hasattr(ds, "ManufacturerModelName") else None,
            "institution_name": str(ds.InstitutionName) if hasattr(ds, "InstitutionName") else None,
        }

        # Extract additional DICOM tags
        metadata["dicom_tags"] = self._extract_additional_tags(ds)

        return metadata

    def _extract_age(self, ds: FileDataset) -> Optional[int]:
        """Extract patient age from DICOM"""
        if hasattr(ds, "PatientAge"):
            age_str = str(ds.PatientAge)
            # PatientAge format: "025Y" (years), "003M" (months), "012W" (weeks), "005D" (days)
            if age_str.endswith("Y"):
                return int(age_str[:-1])
            elif age_str.endswith("M"):
                return int(age_str[:-1]) // 12
            elif age_str.endswith("W"):
                return int(age_str[:-1]) // 52
            elif age_str.endswith("D"):
                return int(age_str[:-1]) // 365
        return None

    def _parse_dicom_date(self, date_str: str) -> Optional[datetime]:
        """Parse DICOM date string (YYYYMMDD)"""
        try:
            return datetime.strptime(date_str, "%Y%m%d")
        except:
            return None

    def _extract_additional_tags(self, ds: FileDataset) -> Dict[str, Any]:
        """Extract additional DICOM tags for storage"""
        additional_tags = {}

        # List of additional tags to extract
        tags = [
            "StudyDate",
            "StudyTime",
            "StudyDescription",
            "SeriesDescription",
            "ProtocolName",
            "WindowCenter",
            "WindowWidth",
            "RescaleIntercept",
            "RescaleSlope",
            "KVP",
            "Exposure",
            "ExposureTime",
            "XRayTubeCurrent",
            "ContrastBolusAgent",
        ]

        for tag in tags:
            if hasattr(ds, tag):
                value = getattr(ds, tag)
                # Convert to string for JSON serialization
                additional_tags[tag] = str(value) if value is not None else None

        return additional_tags

    async def extract_pixel_array(self, ds: FileDataset) -> np.ndarray:
        """
        Extract pixel array from DICOM

        Args:
            ds: PyDICOM Dataset

        Returns:
            Numpy array of pixel data
        """
        try:
            pixel_array = ds.pixel_array

            # Apply rescale slope and intercept (for CT Hounsfield units)
            if hasattr(ds, "RescaleSlope") and hasattr(ds, "RescaleIntercept"):
                slope = float(ds.RescaleSlope)
                intercept = float(ds.RescaleIntercept)
                pixel_array = pixel_array * slope + intercept

            logger.info(
                "extracted_pixel_array",
                shape=pixel_array.shape,
                dtype=pixel_array.dtype,
                min_value=pixel_array.min(),
                max_value=pixel_array.max(),
            )

            return pixel_array
        except Exception as e:
            logger.error("failed_to_extract_pixel_array", error=str(e))
            raise ValueError(f"Failed to extract pixel array: {str(e)}")

    async def normalize_pixel_array(self, pixel_array: np.ndarray, modality: str) -> np.ndarray:
        """
        Normalize pixel array based on modality

        Args:
            pixel_array: Raw pixel array
            modality: DICOM modality (CT, MRI, XR, etc.)

        Returns:
            Normalized pixel array (0-255)
        """
        if modality == "CT":
            # CT windowing (lung window: -600 to 1500 HU)
            window_center = 450
            window_width = 2100
            min_val = window_center - window_width / 2
            max_val = window_center + window_width / 2
        elif modality in ["MRI", "MR"]:
            # MRI: normalize to percentiles
            min_val = np.percentile(pixel_array, 1)
            max_val = np.percentile(pixel_array, 99)
        else:
            # X-Ray and others: use full range
            min_val = pixel_array.min()
            max_val = pixel_array.max()

        # Clip and normalize to 0-255
        clipped = np.clip(pixel_array, min_val, max_val)
        normalized = ((clipped - min_val) / (max_val - min_val) * 255).astype(np.uint8)

        return normalized

    async def resize_image(self, image: np.ndarray, target_size: int = 512) -> np.ndarray:
        """
        Resize image to target size while maintaining aspect ratio

        Args:
            image: Input image array
            target_size: Target size (default 512)

        Returns:
            Resized image array
        """
        pil_image = Image.fromarray(image)
        pil_image.thumbnail((target_size, target_size), Image.Resampling.LANCZOS)

        # Create a black square canvas
        canvas = Image.new("L", (target_size, target_size), 0)

        # Paste the resized image in the center
        offset = ((target_size - pil_image.width) // 2, (target_size - pil_image.height) // 2)
        canvas.paste(pil_image, offset)

        return np.array(canvas)

    async def anonymize_dicom(self, ds: FileDataset) -> FileDataset:
        """
        Anonymize DICOM file (remove PHI)

        Args:
            ds: PyDICOM Dataset

        Returns:
            Anonymized dataset
        """
        logger.info("anonymizing_dicom", sop_instance_uid=str(ds.SOPInstanceUID))

        # Tags to remove (PHI)
        phi_tags = [
            "PatientName",
            "PatientBirthDate",
            "PatientAddress",
            "PatientTelephoneNumbers",
            "InstitutionAddress",
            "ReferringPhysicianName",
            "ReferringPhysicianAddress",
            "ReferringPhysicianTelephoneNumbers",
            "PerformingPhysicianName",
            "OperatorsName",
            "PhysiciansOfRecord",
            "NameOfPhysiciansReadingStudy",
        ]

        for tag in phi_tags:
            if hasattr(ds, tag):
                delattr(ds, tag)

        # Replace patient ID with hash
        if hasattr(ds, "PatientID"):
            original_id = str(ds.PatientID)
            hashed_id = hashlib.sha256(original_id.encode()).hexdigest()[:16]
            ds.PatientID = hashed_id

        # Generate new UIDs
        ds.StudyInstanceUID = generate_uid()
        ds.SeriesInstanceUID = generate_uid()
        ds.SOPInstanceUID = generate_uid()

        logger.info("dicom_anonymized", new_sop_instance_uid=str(ds.SOPInstanceUID))

        return ds

    async def save_dicom(self, ds: FileDataset, output_path: str) -> str:
        """
        Save DICOM file

        Args:
            ds: PyDICOM Dataset
            output_path: Output file path

        Returns:
            Saved file path
        """
        try:
            output_path_obj = Path(output_path)
            output_path_obj.parent.mkdir(parents=True, exist_ok=True)

            ds.save_as(str(output_path_obj))
            logger.info("dicom_saved", path=output_path)

            return str(output_path_obj)
        except Exception as e:
            logger.error("failed_to_save_dicom", path=output_path, error=str(e))
            raise

    async def calculate_file_hash(self, file_path: str) -> str:
        """
        Calculate SHA-256 hash of file

        Args:
            file_path: Path to file

        Returns:
            Hex digest of hash
        """
        sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                sha256.update(chunk)
        return sha256.hexdigest()

    async def validate_dicom(self, ds: FileDataset) -> Tuple[bool, Optional[str]]:
        """
        Validate DICOM file

        Args:
            ds: PyDICOM Dataset

        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check required tags
        required_tags = [
            "SOPInstanceUID",
            "StudyInstanceUID",
            "SeriesInstanceUID",
            "Modality",
            "PatientID",
        ]

        for tag in required_tags:
            if not hasattr(ds, tag):
                return False, f"Missing required tag: {tag}"

        # Check pixel data
        if not hasattr(ds, "PixelData"):
            return False, "Missing pixel data"

        # Check image dimensions
        if hasattr(ds, "Rows") and hasattr(ds, "Columns"):
            if ds.Rows < 64 or ds.Columns < 64:
                return False, "Image dimensions too small (minimum 64x64)"

        # Check modality support
        supported_modalities = ["CT", "MR", "MRI", "XR", "CR", "DX", "US", "PT", "NM"]
        if str(ds.Modality) not in supported_modalities:
            return False, f"Unsupported modality: {ds.Modality}"

        return True, None

    async def preprocess_for_inference(
        self,
        ds: FileDataset,
        target_size: int = 512,
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Preprocess DICOM for ML inference

        Args:
            ds: PyDICOM Dataset
            target_size: Target image size

        Returns:
            Tuple of (preprocessed_image, preprocessing_info)
        """
        # Extract pixel array
        pixel_array = await self.extract_pixel_array(ds)

        # Normalize
        modality = str(ds.Modality)
        normalized = await self.normalize_pixel_array(pixel_array, modality)

        # Resize
        resized = await self.resize_image(normalized, target_size)

        # Preprocessing info
        preprocessing_info = {
            "original_shape": pixel_array.shape,
            "normalized_shape": normalized.shape,
            "final_shape": resized.shape,
            "target_size": target_size,
            "modality": modality,
        }

        return resized, preprocessing_info
