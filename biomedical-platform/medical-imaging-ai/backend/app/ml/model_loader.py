"""
ML Model Loader
Loads and manages PyTorch models for medical image inference
Supports ResNet50, EfficientNet, DenseNet, and custom models
"""

import structlog
import torch
import torch.nn as nn
from pathlib import Path
from typing import Dict, Optional, List, Any
import timm  # PyTorch Image Models
from collections import OrderedDict

from app.core.config import settings

logger = structlog.get_logger()


class ModelLoader:
    """
    Loads and manages ML models for medical imaging inference
    Supports multiple model architectures with automatic GPU/CPU selection
    """

    def __init__(self):
        self.models: Dict[str, torch.nn.Module] = {}
        self.model_info: Dict[str, Dict[str, Any]] = {}
        self.device = self._get_device()
        self.model_path = Path(settings.MODEL_PATH)
        self.model_path.mkdir(parents=True, exist_ok=True)

    def _get_device(self) -> torch.device:
        """Get compute device (GPU or CPU)"""
        if settings.GPU_ENABLED and torch.cuda.is_available():
            device = torch.device(f"cuda:{settings.GPU_DEVICE_ID}")
            logger.info("using_gpu", device=str(device), gpu_name=torch.cuda.get_device_name(0))
        else:
            device = torch.device("cpu")
            logger.info("using_cpu")
        return device

    async def load_model(
        self,
        model_name: str,
        model_type: str,
        checkpoint_path: Optional[str] = None,
        num_classes: int = 2,
        pretrained: bool = True,
    ) -> torch.nn.Module:
        """
        Load a model

        Args:
            model_name: Unique name for the model
            model_type: Model architecture (resnet50, efficientnet_b0, densenet121, etc.)
            checkpoint_path: Path to model checkpoint (optional)
            num_classes: Number of output classes
            pretrained: Use pretrained ImageNet weights

        Returns:
            Loaded PyTorch model
        """
        logger.info(
            "loading_model",
            model_name=model_name,
            model_type=model_type,
            checkpoint_path=checkpoint_path,
            num_classes=num_classes,
        )

        try:
            # Load model architecture using timm
            if model_type.startswith("resnet"):
                model = timm.create_model(model_type, pretrained=pretrained, num_classes=num_classes)
            elif model_type.startswith("efficientnet"):
                model = timm.create_model(model_type, pretrained=pretrained, num_classes=num_classes)
            elif model_type.startswith("densenet"):
                model = timm.create_model(model_type, pretrained=pretrained, num_classes=num_classes)
            elif model_type.startswith("vit"):  # Vision Transformer
                model = timm.create_model(model_type, pretrained=pretrained, num_classes=num_classes)
            else:
                # Try to create any timm model
                model = timm.create_model(model_type, pretrained=pretrained, num_classes=num_classes)

            # Load checkpoint if provided
            if checkpoint_path:
                checkpoint_path_obj = Path(checkpoint_path)
                if checkpoint_path_obj.exists():
                    checkpoint = torch.load(checkpoint_path, map_location=self.device)

                    # Handle different checkpoint formats
                    if isinstance(checkpoint, dict):
                        if "state_dict" in checkpoint:
                            state_dict = checkpoint["state_dict"]
                        elif "model_state_dict" in checkpoint:
                            state_dict = checkpoint["model_state_dict"]
                        else:
                            state_dict = checkpoint
                    else:
                        state_dict = checkpoint

                    # Remove 'module.' prefix if present (from DataParallel)
                    state_dict = self._remove_module_prefix(state_dict)

                    model.load_state_dict(state_dict)
                    logger.info("checkpoint_loaded", path=checkpoint_path)
                else:
                    logger.warning("checkpoint_not_found", path=checkpoint_path)

            # Move model to device
            model = model.to(self.device)

            # Set to evaluation mode
            model.eval()

            # Store model
            self.models[model_name] = model

            # Store model info
            self.model_info[model_name] = {
                "model_type": model_type,
                "num_classes": num_classes,
                "checkpoint_path": checkpoint_path,
                "device": str(self.device),
                "num_parameters": sum(p.numel() for p in model.parameters()),
            }

            logger.info(
                "model_loaded_successfully",
                model_name=model_name,
                num_parameters=self.model_info[model_name]["num_parameters"],
            )

            return model

        except Exception as e:
            logger.error("failed_to_load_model", model_name=model_name, error=str(e))
            raise

    def _remove_module_prefix(self, state_dict: Dict[str, torch.Tensor]) -> Dict[str, torch.Tensor]:
        """Remove 'module.' prefix from state dict keys"""
        new_state_dict = OrderedDict()
        for k, v in state_dict.items():
            if k.startswith("module."):
                new_state_dict[k[7:]] = v  # Remove 'module.' prefix
            else:
                new_state_dict[k] = v
        return new_state_dict

    async def load_all_models(self) -> None:
        """Load all enabled models"""
        logger.info("loading_all_models")

        # ResNet50
        if settings.RESNET50_ENABLED:
            try:
                await self.load_model(
                    model_name="resnet50_chest_xray",
                    model_type="resnet50",
                    num_classes=14,  # 14 common chest X-ray pathologies
                    pretrained=True,
                )
            except Exception as e:
                logger.error("failed_to_load_resnet50", error=str(e))

        # EfficientNet
        if settings.EFFICIENTNET_ENABLED:
            try:
                await self.load_model(
                    model_name="efficientnet_b0_ct_scan",
                    model_type="efficientnet_b0",
                    num_classes=3,  # COVID-19, Pneumonia, Normal
                    pretrained=True,
                )
            except Exception as e:
                logger.error("failed_to_load_efficientnet", error=str(e))

        # DenseNet121
        if settings.DENSENET_ENABLED:
            try:
                await self.load_model(
                    model_name="densenet121_brain_mri",
                    model_type="densenet121",
                    num_classes=4,  # Glioma, Meningioma, Pituitary, No tumor
                    pretrained=True,
                )
            except Exception as e:
                logger.error("failed_to_load_densenet", error=str(e))

        logger.info("all_models_loaded", count=len(self.models))

    def get_model(self, model_name: str) -> Optional[torch.nn.Module]:
        """Get a loaded model by name"""
        return self.models.get(model_name)

    def get_model_info(self, model_name: str) -> Optional[Dict[str, Any]]:
        """Get model information"""
        return self.model_info.get(model_name)

    def list_models(self) -> List[str]:
        """List all loaded models"""
        return list(self.models.keys())

    def is_ready(self) -> bool:
        """Check if models are loaded and ready"""
        return len(self.models) > 0

    async def unload_model(self, model_name: str) -> None:
        """Unload a model from memory"""
        if model_name in self.models:
            del self.models[model_name]
            del self.model_info[model_name]
            torch.cuda.empty_cache()  # Clear GPU memory
            logger.info("model_unloaded", model_name=model_name)

    async def cleanup(self) -> None:
        """Clean up all models"""
        logger.info("cleaning_up_models", count=len(self.models))
        for model_name in list(self.models.keys()):
            await self.unload_model(model_name)

    def get_device(self) -> torch.device:
        """Get the compute device"""
        return self.device

    async def download_pretrained_model(
        self,
        model_name: str,
        url: str,
        output_path: Optional[str] = None,
    ) -> str:
        """
        Download pretrained model from URL

        Args:
            model_name: Name of the model
            url: URL to download from
            output_path: Output path (default: model_path/model_name.pth)

        Returns:
            Path to downloaded model
        """
        import aiohttp
        import aiofiles

        if output_path is None:
            output_path = str(self.model_path / f"{model_name}.pth")

        logger.info("downloading_model", model_name=model_name, url=url)

        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        async with aiofiles.open(output_path, "wb") as f:
                            await f.write(await response.read())
                        logger.info("model_downloaded", path=output_path)
                        return output_path
                    else:
                        raise ValueError(f"Failed to download model: HTTP {response.status}")
        except Exception as e:
            logger.error("model_download_failed", error=str(e))
            raise

    async def create_ensemble(
        self,
        ensemble_name: str,
        model_names: List[str],
        weights: Optional[List[float]] = None,
    ) -> "EnsembleModel":
        """
        Create an ensemble of models

        Args:
            ensemble_name: Name for the ensemble
            model_names: List of model names to ensemble
            weights: Optional weights for each model (default: equal weights)

        Returns:
            EnsembleModel instance
        """
        models = [self.get_model(name) for name in model_names]

        if any(m is None for m in models):
            raise ValueError("Some models not found")

        if weights is None:
            weights = [1.0 / len(models)] * len(models)

        ensemble = EnsembleModel(models, weights, self.device)
        self.models[ensemble_name] = ensemble

        logger.info("ensemble_created", name=ensemble_name, num_models=len(models))

        return ensemble


class EnsembleModel(nn.Module):
    """
    Ensemble model that combines predictions from multiple models
    """

    def __init__(self, models: List[nn.Module], weights: List[float], device: torch.device):
        super().__init__()
        self.models = nn.ModuleList(models)
        self.weights = torch.tensor(weights, device=device)
        self.device = device

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """Forward pass through ensemble"""
        outputs = []
        for model in self.models:
            with torch.no_grad():
                output = model(x)
                outputs.append(output)

        # Stack outputs
        stacked = torch.stack(outputs, dim=0)

        # Weighted average
        weights = self.weights.view(-1, 1, 1)
        weighted = stacked * weights
        ensemble_output = weighted.sum(dim=0)

        return ensemble_output


class ModelRegistry:
    """
    Registry of available models with metadata
    """

    MODELS = {
        "resnet50_chest_xray": {
            "description": "ResNet50 for chest X-ray pathology detection",
            "architecture": "resnet50",
            "num_classes": 14,
            "classes": [
                "Atelectasis",
                "Cardiomegaly",
                "Effusion",
                "Infiltration",
                "Mass",
                "Nodule",
                "Pneumonia",
                "Pneumothorax",
                "Consolidation",
                "Edema",
                "Emphysema",
                "Fibrosis",
                "Pleural_Thickening",
                "Hernia",
            ],
            "modality": "XR",
            "input_size": 512,
        },
        "efficientnet_b0_ct_scan": {
            "description": "EfficientNet-B0 for COVID-19 detection from CT scans",
            "architecture": "efficientnet_b0",
            "num_classes": 3,
            "classes": ["COVID-19", "Pneumonia", "Normal"],
            "modality": "CT",
            "input_size": 512,
        },
        "densenet121_brain_mri": {
            "description": "DenseNet121 for brain tumor classification from MRI",
            "architecture": "densenet121",
            "num_classes": 4,
            "classes": ["Glioma", "Meningioma", "Pituitary", "No_Tumor"],
            "modality": "MRI",
            "input_size": 512,
        },
    }

    @classmethod
    def get_model_config(cls, model_name: str) -> Optional[Dict[str, Any]]:
        """Get configuration for a model"""
        return cls.MODELS.get(model_name)

    @classmethod
    def list_available_models(cls) -> List[str]:
        """List all available models"""
        return list(cls.MODELS.keys())

    @classmethod
    def get_models_by_modality(cls, modality: str) -> List[str]:
        """Get models for specific modality"""
        return [name for name, config in cls.MODELS.items() if config.get("modality") == modality]
