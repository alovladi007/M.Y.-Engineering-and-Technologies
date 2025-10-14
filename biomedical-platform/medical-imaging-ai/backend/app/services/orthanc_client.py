"""
Orthanc PACS Client
Integrates with Orthanc PACS for DICOM query/retrieve operations
"""

import structlog
from typing import Dict, List, Optional, Any
import httpx
from urllib.parse import urljoin

from app.core.config import settings

logger = structlog.get_logger()


class OrthancClient:
    """
    Client for Orthanc PACS server
    Provides DICOM query, retrieve, and store operations
    """

    def __init__(self):
        self.base_url = settings.ORTHANC_URL
        self.username = settings.ORTHANC_USERNAME
        self.password = settings.ORTHANC_PASSWORD
        self.aet = settings.ORTHANC_AET

        # Create auth if credentials provided
        self.auth = (self.username, self.password) if self.username and self.password else None

    async def _request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        json: Optional[Dict] = None,
        timeout: int = 30,
    ) -> Dict[str, Any]:
        """
        Make HTTP request to Orthanc

        Args:
            method: HTTP method
            endpoint: API endpoint
            data: Form data
            json: JSON payload
            timeout: Request timeout

        Returns:
            Response JSON
        """
        url = urljoin(self.base_url, endpoint)

        logger.info("orthanc_request", method=method, url=url)

        async with httpx.AsyncClient() as client:
            try:
                response = await client.request(
                    method=method,
                    url=url,
                    auth=self.auth,
                    data=data,
                    json=json,
                    timeout=timeout,
                )
                response.raise_for_status()

                # Handle different response types
                content_type = response.headers.get("content-type", "")
                if "application/json" in content_type:
                    return response.json()
                else:
                    return {"content": response.content}

            except httpx.HTTPStatusError as e:
                logger.error("orthanc_request_failed", status=e.response.status_code, error=str(e))
                raise
            except Exception as e:
                logger.error("orthanc_connection_failed", error=str(e))
                raise

    async def get_system_info(self) -> Dict[str, Any]:
        """Get Orthanc system information"""
        return await self._request("GET", "/system")

    async def get_statistics(self) -> Dict[str, Any]:
        """Get Orthanc statistics"""
        return await self._request("GET", "/statistics")

    async def search_studies(
        self,
        patient_id: Optional[str] = None,
        patient_name: Optional[str] = None,
        study_date: Optional[str] = None,
        modality: Optional[str] = None,
        limit: int = 100,
    ) -> List[Dict[str, Any]]:
        """
        Search for studies

        Args:
            patient_id: Patient ID
            patient_name: Patient name
            study_date: Study date (YYYYMMDD)
            modality: Modality
            limit: Maximum results

        Returns:
            List of matching studies
        """
        logger.info(
            "searching_studies",
            patient_id=patient_id,
            patient_name=patient_name,
            study_date=study_date,
            modality=modality,
        )

        # Build query
        query = {}
        if patient_id:
            query["PatientID"] = patient_id
        if patient_name:
            query["PatientName"] = patient_name
        if study_date:
            query["StudyDate"] = study_date
        if modality:
            query["ModalitiesInStudy"] = modality

        query["Level"] = "Study"
        query["Limit"] = limit

        # Search
        results = await self._request("POST", "/tools/find", json=query)

        # Get details for each study
        studies = []
        for study_id in results:
            study_info = await self.get_study(study_id)
            studies.append(study_info)

        logger.info("studies_found", count=len(studies))

        return studies

    async def get_study(self, study_id: str) -> Dict[str, Any]:
        """
        Get study information

        Args:
            study_id: Orthanc study ID

        Returns:
            Study information
        """
        return await self._request("GET", f"/studies/{study_id}")

    async def get_study_metadata(self, study_id: str) -> Dict[str, Any]:
        """Get study DICOM metadata"""
        instances = await self._request("GET", f"/studies/{study_id}/instances")
        if instances:
            # Get metadata from first instance
            instance_id = instances[0]["ID"]
            return await self._request("GET", f"/instances/{instance_id}/simplified-tags")
        return {}

    async def get_series(self, series_id: str) -> Dict[str, Any]:
        """
        Get series information

        Args:
            series_id: Orthanc series ID

        Returns:
            Series information
        """
        return await self._request("GET", f"/series/{series_id}")

    async def get_instance(self, instance_id: str) -> Dict[str, Any]:
        """
        Get instance information

        Args:
            instance_id: Orthanc instance ID

        Returns:
            Instance information
        """
        return await self._request("GET", f"/instances/{instance_id}")

    async def download_instance(self, instance_id: str) -> bytes:
        """
        Download DICOM instance

        Args:
            instance_id: Orthanc instance ID

        Returns:
            DICOM file bytes
        """
        logger.info("downloading_instance", instance_id=instance_id)

        result = await self._request("GET", f"/instances/{instance_id}/file")
        return result.get("content", b"")

    async def download_study(self, study_id: str) -> bytes:
        """
        Download entire study as ZIP

        Args:
            study_id: Orthanc study ID

        Returns:
            ZIP file bytes
        """
        logger.info("downloading_study", study_id=study_id)

        result = await self._request("GET", f"/studies/{study_id}/archive")
        return result.get("content", b"")

    async def upload_dicom(self, dicom_bytes: bytes) -> Dict[str, Any]:
        """
        Upload DICOM file to Orthanc

        Args:
            dicom_bytes: DICOM file bytes

        Returns:
            Upload result
        """
        logger.info("uploading_dicom", size=len(dicom_bytes))

        return await self._request("POST", "/instances", data=dicom_bytes)

    async def delete_study(self, study_id: str) -> None:
        """
        Delete study from Orthanc

        Args:
            study_id: Orthanc study ID
        """
        logger.info("deleting_study", study_id=study_id)
        await self._request("DELETE", f"/studies/{study_id}")

    async def delete_series(self, series_id: str) -> None:
        """
        Delete series from Orthanc

        Args:
            series_id: Orthanc series ID
        """
        logger.info("deleting_series", series_id=series_id)
        await self._request("DELETE", f"/series/{series_id}")

    async def delete_instance(self, instance_id: str) -> None:
        """
        Delete instance from Orthanc

        Args:
            instance_id: Orthanc instance ID
        """
        logger.info("deleting_instance", instance_id=instance_id)
        await self._request("DELETE", f"/instances/{instance_id}")

    async def anonymize_study(
        self,
        study_id: str,
        keep_tags: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Anonymize study

        Args:
            study_id: Orthanc study ID
            keep_tags: DICOM tags to keep

        Returns:
            Anonymized study info
        """
        logger.info("anonymizing_study", study_id=study_id)

        anonymize_config = {
            "Keep": keep_tags or [],
            "Force": True,
        }

        return await self._request("POST", f"/studies/{study_id}/anonymize", json=anonymize_config)

    async def modify_study(
        self,
        study_id: str,
        replace_tags: Dict[str, str],
    ) -> Dict[str, Any]:
        """
        Modify study DICOM tags

        Args:
            study_id: Orthanc study ID
            replace_tags: Tags to replace

        Returns:
            Modified study info
        """
        logger.info("modifying_study", study_id=study_id, tags=list(replace_tags.keys()))

        modify_config = {
            "Replace": replace_tags,
            "Force": True,
        }

        return await self._request("POST", f"/studies/{study_id}/modify", json=modify_config)

    async def get_study_instances(self, study_id: str) -> List[Dict[str, Any]]:
        """
        Get all instances in a study

        Args:
            study_id: Orthanc study ID

        Returns:
            List of instances
        """
        return await self._request("GET", f"/studies/{study_id}/instances")

    async def get_modalities(self) -> List[str]:
        """Get configured DICOM modalities"""
        modalities = await self._request("GET", "/modalities")
        return modalities

    async def query_remote_modality(
        self,
        modality: str,
        query: Dict[str, str],
    ) -> List[Dict[str, Any]]:
        """
        Query remote DICOM modality

        Args:
            modality: Modality name
            query: DICOM query parameters

        Returns:
            Query results
        """
        logger.info("querying_remote_modality", modality=modality, query=query)

        return await self._request("POST", f"/modalities/{modality}/query", json={"Query": query})

    async def retrieve_from_modality(
        self,
        modality: str,
        query_id: str,
    ) -> Dict[str, Any]:
        """
        Retrieve study from remote modality

        Args:
            modality: Modality name
            query_id: Query result ID

        Returns:
            Retrieve result
        """
        logger.info("retrieving_from_modality", modality=modality, query_id=query_id)

        return await self._request("POST", f"/queries/{query_id}/retrieve", json={"TargetAet": self.aet})

    async def send_to_modality(
        self,
        modality: str,
        study_id: str,
    ) -> Dict[str, Any]:
        """
        Send study to remote modality

        Args:
            modality: Modality name
            study_id: Study ID to send

        Returns:
            Send result
        """
        logger.info("sending_to_modality", modality=modality, study_id=study_id)

        return await self._request("POST", f"/modalities/{modality}/store", json={"Resources": [study_id]})

    async def get_worklist(self) -> List[Dict[str, Any]]:
        """
        Get DICOM worklist

        Returns:
            List of worklist items
        """
        # Note: Worklist requires plugin configuration
        try:
            return await self._request("GET", "/worklist")
        except Exception as e:
            logger.warning("worklist_not_available", error=str(e))
            return []

    async def is_available(self) -> bool:
        """
        Check if Orthanc is available

        Returns:
            True if available
        """
        try:
            await self.get_system_info()
            return True
        except Exception:
            return False
