"""
Grad-CAM Service
Implements Gradient-weighted Class Activation Mapping for explainable AI
Generates heatmaps showing which regions of medical images influence model predictions
"""

import cv2
import numpy as np
import structlog
import torch
import torch.nn.functional as F
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any

from pytorch_grad_cam import GradCAM, GradCAMPlusPlus, ScoreCAM, XGradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

from app.core.config import settings

logger = structlog.get_logger()


class GradCAMService:
    """
    Grad-CAM visualization service for medical imaging models
    Provides explainable AI by highlighting image regions that contribute to predictions
    """

    def __init__(self):
        self.colormap = getattr(cv2, f"COLORMAP_{settings.GRADCAM_COLORMAP.upper()}", cv2.COLORMAP_JET)
        self.alpha = settings.GRADCAM_ALPHA

    def get_target_layer(self, model: torch.nn.Module, layer_name: Optional[str] = None) -> torch.nn.Module:
        """
        Get the target layer for Grad-CAM

        Args:
            model: PyTorch model
            layer_name: Specific layer name (if None, auto-detect last conv layer)

        Returns:
            Target layer module
        """
        if layer_name:
            # Get specific layer by name
            for name, module in model.named_modules():
                if name == layer_name:
                    return module
            raise ValueError(f"Layer {layer_name} not found in model")

        # Auto-detect last convolutional layer
        target_layer = None
        for module in model.modules():
            if isinstance(module, (torch.nn.Conv2d, torch.nn.Conv3d)):
                target_layer = module

        if target_layer is None:
            raise ValueError("No convolutional layers found in model")

        logger.info("auto_detected_target_layer", layer=target_layer.__class__.__name__)
        return target_layer

    async def generate_gradcam(
        self,
        model: torch.nn.Module,
        input_tensor: torch.Tensor,
        target_class: int,
        method: str = "gradcam",
        target_layer_name: Optional[str] = None,
    ) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Generate Grad-CAM heatmap

        Args:
            model: PyTorch model
            input_tensor: Input image tensor (B, C, H, W)
            target_class: Target class index for visualization
            method: Grad-CAM variant ('gradcam', 'gradcam++', 'scorecam', 'xgradcam')
            target_layer_name: Specific layer name (auto-detect if None)

        Returns:
            Tuple of (heatmap, metadata)
        """
        logger.info(
            "generating_gradcam",
            method=method,
            target_class=target_class,
            input_shape=input_tensor.shape,
        )

        try:
            # Get target layer
            target_layer = self.get_target_layer(model, target_layer_name)

            # Select Grad-CAM method
            if method == "gradcam++":
                cam = GradCAMPlusPlus(model=model, target_layers=[target_layer])
            elif method == "scorecam":
                cam = ScoreCAM(model=model, target_layers=[target_layer])
            elif method == "xgradcam":
                cam = XGradCAM(model=model, target_layers=[target_layer])
            else:  # default gradcam
                cam = GradCAM(model=model, target_layers=[target_layer])

            # Create target for specific class
            targets = [ClassifierOutputTarget(target_class)]

            # Generate CAM
            grayscale_cam = cam(input_tensor=input_tensor, targets=targets)

            # Get first image from batch
            heatmap = grayscale_cam[0, :]

            # Metadata
            metadata = {
                "method": method,
                "target_class": target_class,
                "target_layer": str(target_layer),
                "heatmap_shape": heatmap.shape,
                "heatmap_min": float(heatmap.min()),
                "heatmap_max": float(heatmap.max()),
                "heatmap_mean": float(heatmap.mean()),
            }

            logger.info("gradcam_generated", metadata=metadata)

            return heatmap, metadata

        except Exception as e:
            logger.error("gradcam_generation_failed", error=str(e))
            raise

    async def overlay_heatmap(
        self,
        original_image: np.ndarray,
        heatmap: np.ndarray,
        alpha: Optional[float] = None,
    ) -> np.ndarray:
        """
        Overlay Grad-CAM heatmap on original image

        Args:
            original_image: Original image (H, W) or (H, W, 3)
            heatmap: Grad-CAM heatmap (H, W)
            alpha: Overlay transparency (use settings default if None)

        Returns:
            Overlayed image (H, W, 3)
        """
        if alpha is None:
            alpha = self.alpha

        # Ensure original image is RGB
        if len(original_image.shape) == 2:
            original_image = cv2.cvtColor(original_image, cv2.COLOR_GRAY2RGB)
        elif original_image.shape[2] == 1:
            original_image = cv2.cvtColor(original_image, cv2.COLOR_GRAY2RGB)

        # Ensure image is in 0-1 range
        if original_image.max() > 1.0:
            original_image = original_image.astype(np.float32) / 255.0

        # Resize heatmap to match image size
        if heatmap.shape != original_image.shape[:2]:
            heatmap = cv2.resize(heatmap, (original_image.shape[1], original_image.shape[0]))

        # Use pytorch_grad_cam's show_cam_on_image function
        overlayed = show_cam_on_image(original_image, heatmap, use_rgb=True)

        return overlayed

    async def apply_colormap(self, heatmap: np.ndarray) -> np.ndarray:
        """
        Apply colormap to grayscale heatmap

        Args:
            heatmap: Grayscale heatmap (H, W)

        Returns:
            Colored heatmap (H, W, 3)
        """
        # Normalize to 0-255
        heatmap_uint8 = (heatmap * 255).astype(np.uint8)

        # Apply colormap
        colored_heatmap = cv2.applyColorMap(heatmap_uint8, self.colormap)

        # Convert BGR to RGB
        colored_heatmap = cv2.cvtColor(colored_heatmap, cv2.COLOR_BGR2RGB)

        return colored_heatmap

    async def extract_attention_regions(
        self,
        heatmap: np.ndarray,
        threshold: float = 0.7,
        min_area: int = 100,
    ) -> List[Dict[str, Any]]:
        """
        Extract high-attention regions from Grad-CAM heatmap

        Args:
            heatmap: Grad-CAM heatmap (H, W)
            threshold: Activation threshold (0.0-1.0)
            min_area: Minimum region area in pixels

        Returns:
            List of attention regions with bounding boxes
        """
        # Threshold heatmap
        binary_mask = (heatmap > threshold).astype(np.uint8) * 255

        # Find contours
        contours, _ = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        attention_regions = []

        for contour in contours:
            area = cv2.contourArea(contour)
            if area < min_area:
                continue

            # Get bounding box
            x, y, w, h = cv2.boundingRect(contour)

            # Calculate average activation in region
            region_mask = np.zeros_like(heatmap)
            cv2.drawContours(region_mask, [contour], -1, 1, -1)
            avg_activation = float(np.mean(heatmap[region_mask == 1]))

            attention_regions.append(
                {
                    "x": int(x),
                    "y": int(y),
                    "width": int(w),
                    "height": int(h),
                    "area": int(area),
                    "activation": avg_activation,
                }
            )

        # Sort by activation (highest first)
        attention_regions.sort(key=lambda r: r["activation"], reverse=True)

        logger.info("extracted_attention_regions", count=len(attention_regions))

        return attention_regions

    async def generate_multi_layer_gradcam(
        self,
        model: torch.nn.Module,
        input_tensor: torch.Tensor,
        target_class: int,
        layer_names: List[str],
    ) -> Dict[str, Tuple[np.ndarray, Dict[str, Any]]]:
        """
        Generate Grad-CAM for multiple layers

        Args:
            model: PyTorch model
            input_tensor: Input image tensor
            target_class: Target class index
            layer_names: List of layer names

        Returns:
            Dictionary mapping layer names to (heatmap, metadata)
        """
        results = {}

        for layer_name in layer_names:
            try:
                heatmap, metadata = await self.generate_gradcam(
                    model=model,
                    input_tensor=input_tensor,
                    target_class=target_class,
                    target_layer_name=layer_name,
                )
                results[layer_name] = (heatmap, metadata)
            except Exception as e:
                logger.error("multi_layer_gradcam_failed", layer=layer_name, error=str(e))

        return results

    async def save_visualization(
        self,
        image: np.ndarray,
        output_path: str,
        quality: int = 95,
    ) -> str:
        """
        Save visualization to file

        Args:
            image: Image array (RGB)
            output_path: Output file path
            quality: JPEG quality (1-100)

        Returns:
            Saved file path
        """
        output_path_obj = Path(output_path)
        output_path_obj.parent.mkdir(parents=True, exist_ok=True)

        # Convert RGB to BGR for OpenCV
        image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        # Save image
        cv2.imwrite(str(output_path_obj), image_bgr, [cv2.IMWRITE_JPEG_QUALITY, quality])

        logger.info("visualization_saved", path=output_path)

        return str(output_path_obj)

    async def create_comparison_visualization(
        self,
        original_image: np.ndarray,
        heatmap: np.ndarray,
        overlayed_image: np.ndarray,
    ) -> np.ndarray:
        """
        Create side-by-side comparison of original, heatmap, and overlay

        Args:
            original_image: Original image
            heatmap: Grad-CAM heatmap
            overlayed_image: Overlayed image

        Returns:
            Concatenated comparison image
        """
        # Ensure all images have same height
        height = original_image.shape[0]

        # Prepare original image
        if len(original_image.shape) == 2:
            original_rgb = cv2.cvtColor(original_image, cv2.COLOR_GRAY2RGB)
        else:
            original_rgb = original_image

        # Prepare heatmap
        heatmap_colored = await self.apply_colormap(heatmap)

        # Resize all to same height
        original_resized = cv2.resize(original_rgb, (height, height))
        heatmap_resized = cv2.resize(heatmap_colored, (height, height))
        overlayed_resized = cv2.resize(overlayed_image, (height, height))

        # Concatenate horizontally
        comparison = np.concatenate([original_resized, heatmap_resized, overlayed_resized], axis=1)

        return comparison

    async def calculate_heatmap_quality(self, heatmap: np.ndarray) -> float:
        """
        Calculate quality score for Grad-CAM heatmap

        Args:
            heatmap: Grad-CAM heatmap

        Returns:
            Quality score (0.0-1.0)
        """
        # Factors for quality:
        # 1. Concentration (high activation in small regions is better)
        # 2. Contrast (clear difference between high and low activation)
        # 3. Coverage (not too dispersed, not too concentrated)

        # Concentration score (entropy)
        hist, _ = np.histogram(heatmap.flatten(), bins=50, range=(0, 1))
        hist_normalized = hist / hist.sum()
        hist_normalized = hist_normalized[hist_normalized > 0]  # Remove zeros
        entropy = -np.sum(hist_normalized * np.log2(hist_normalized))
        concentration_score = 1.0 - (entropy / np.log2(50))  # Normalize

        # Contrast score
        contrast_score = float(heatmap.max() - heatmap.mean())

        # Coverage score (percentage of image with activation > 0.5)
        coverage = (heatmap > 0.5).sum() / heatmap.size
        coverage_score = 1.0 - abs(coverage - 0.2)  # Ideal coverage is 20%

        # Weighted average
        quality_score = (0.4 * concentration_score + 0.4 * contrast_score + 0.2 * coverage_score)

        return float(np.clip(quality_score, 0.0, 1.0))
