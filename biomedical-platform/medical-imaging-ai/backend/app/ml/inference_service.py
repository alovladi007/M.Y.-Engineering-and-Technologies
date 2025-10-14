"""
Inference Service
Handles ML model inference for medical images with batch processing and uncertainty quantification
"""

import time
from typing import Dict, List, Optional, Tuple, Any
import structlog

import numpy as np
import torch
import torch.nn.functional as F
from torchvision import transforms

from app.core.config import settings
from app.ml.model_loader import ModelLoader, ModelRegistry

logger = structlog.get_logger()


class InferenceService:
    """
    ML inference service for medical imaging
    Supports batch inference, uncertainty quantification, and multi-label classification
    """

    def __init__(self, model_loader: ModelLoader):
        self.model_loader = model_loader
        self.device = model_loader.get_device()
        self.transforms = self._create_transforms()

    def _create_transforms(self) -> transforms.Compose:
        """Create image preprocessing transforms"""
        return transforms.Compose(
            [
                transforms.ToPILImage(),
                transforms.Resize((settings.IMAGE_SIZE, settings.IMAGE_SIZE)),
                transforms.ToTensor(),
                transforms.Normalize(mean=settings.NORMALIZE_MEAN, std=settings.NORMALIZE_STD),
            ]
        )

    async def preprocess_image(self, image: np.ndarray) -> torch.Tensor:
        """
        Preprocess image for inference

        Args:
            image: Input image (H, W) or (H, W, C)

        Returns:
            Preprocessed tensor (1, C, H, W)
        """
        # Convert grayscale to RGB
        if len(image.shape) == 2:
            image = np.stack([image] * 3, axis=-1)
        elif image.shape[2] == 1:
            image = np.concatenate([image] * 3, axis=-1)

        # Apply transforms
        tensor = self.transforms(image)

        # Add batch dimension
        tensor = tensor.unsqueeze(0)

        return tensor.to(self.device)

    async def run_inference(
        self,
        model_name: str,
        image: np.ndarray,
        return_probabilities: bool = True,
    ) -> Dict[str, Any]:
        """
        Run inference on a single image

        Args:
            model_name: Name of the model to use
            image: Input image
            return_probabilities: Return class probabilities

        Returns:
            Inference results
        """
        start_time = time.time()

        logger.info("running_inference", model_name=model_name, image_shape=image.shape)

        try:
            # Get model
            model = self.model_loader.get_model(model_name)
            if model is None:
                raise ValueError(f"Model not found: {model_name}")

            # Get model config
            model_config = ModelRegistry.get_model_config(model_name)
            if model_config is None:
                raise ValueError(f"Model config not found: {model_name}")

            # Preprocess image
            input_tensor = await self.preprocess_image(image)

            # Run inference
            with torch.no_grad():
                output = model(input_tensor)

            # Get probabilities
            if return_probabilities:
                probabilities = F.softmax(output, dim=1)
            else:
                probabilities = output

            # Convert to numpy
            probabilities_np = probabilities.cpu().numpy()[0]

            # Get predicted class
            predicted_class_idx = int(probabilities_np.argmax())
            confidence = float(probabilities_np[predicted_class_idx])

            # Get class names
            class_names = model_config.get("classes", [f"Class_{i}" for i in range(len(probabilities_np))])

            # Build results
            results = {
                "model_name": model_name,
                "predicted_class_idx": predicted_class_idx,
                "predicted_class": class_names[predicted_class_idx],
                "confidence": confidence,
                "probabilities": probabilities_np.tolist(),
                "classes": class_names,
                "inference_time": time.time() - start_time,
            }

            # Multi-label predictions (all classes with confidence > threshold)
            threshold = 0.5
            multi_label_predictions = []
            for idx, prob in enumerate(probabilities_np):
                if prob > threshold:
                    multi_label_predictions.append(
                        {
                            "label": class_names[idx],
                            "probability": float(prob),
                            "index": idx,
                        }
                    )
            results["multi_label_predictions"] = multi_label_predictions

            logger.info(
                "inference_completed",
                model_name=model_name,
                predicted_class=results["predicted_class"],
                confidence=confidence,
                inference_time=results["inference_time"],
            )

            return results

        except Exception as e:
            logger.error("inference_failed", model_name=model_name, error=str(e))
            raise

    async def run_batch_inference(
        self,
        model_name: str,
        images: List[np.ndarray],
    ) -> List[Dict[str, Any]]:
        """
        Run inference on a batch of images

        Args:
            model_name: Name of the model to use
            images: List of input images

        Returns:
            List of inference results
        """
        start_time = time.time()

        logger.info("running_batch_inference", model_name=model_name, batch_size=len(images))

        try:
            # Get model
            model = self.model_loader.get_model(model_name)
            if model is None:
                raise ValueError(f"Model not found: {model_name}")

            # Get model config
            model_config = ModelRegistry.get_model_config(model_name)

            # Preprocess all images
            tensors = []
            for image in images:
                tensor = await self.preprocess_image(image)
                tensors.append(tensor)

            # Stack into batch
            batch_tensor = torch.cat(tensors, dim=0)

            # Run inference
            with torch.no_grad():
                outputs = model(batch_tensor)

            # Get probabilities
            probabilities = F.softmax(outputs, dim=1)
            probabilities_np = probabilities.cpu().numpy()

            # Get class names
            class_names = model_config.get("classes", [])

            # Build results for each image
            results = []
            for idx, probs in enumerate(probabilities_np):
                predicted_class_idx = int(probs.argmax())
                confidence = float(probs[predicted_class_idx])

                results.append(
                    {
                        "model_name": model_name,
                        "predicted_class_idx": predicted_class_idx,
                        "predicted_class": class_names[predicted_class_idx] if class_names else f"Class_{predicted_class_idx}",
                        "confidence": confidence,
                        "probabilities": probs.tolist(),
                        "classes": class_names,
                    }
                )

            total_time = time.time() - start_time
            avg_time_per_image = total_time / len(images)

            logger.info(
                "batch_inference_completed",
                model_name=model_name,
                batch_size=len(images),
                total_time=total_time,
                avg_time_per_image=avg_time_per_image,
            )

            return results

        except Exception as e:
            logger.error("batch_inference_failed", model_name=model_name, error=str(e))
            raise

    async def run_ensemble_inference(
        self,
        model_names: List[str],
        image: np.ndarray,
    ) -> Dict[str, Any]:
        """
        Run inference using multiple models and ensemble results

        Args:
            model_names: List of model names
            image: Input image

        Returns:
            Ensemble inference results
        """
        logger.info("running_ensemble_inference", model_names=model_names)

        # Run inference with each model
        individual_results = []
        for model_name in model_names:
            result = await self.run_inference(model_name, image)
            individual_results.append(result)

        # Average probabilities (simple ensemble)
        num_classes = len(individual_results[0]["probabilities"])
        avg_probabilities = np.zeros(num_classes)

        for result in individual_results:
            avg_probabilities += np.array(result["probabilities"])

        avg_probabilities /= len(model_names)

        # Get predicted class
        predicted_class_idx = int(avg_probabilities.argmax())
        confidence = float(avg_probabilities[predicted_class_idx])

        ensemble_result = {
            "ensemble_models": model_names,
            "predicted_class_idx": predicted_class_idx,
            "predicted_class": individual_results[0]["classes"][predicted_class_idx],
            "confidence": confidence,
            "probabilities": avg_probabilities.tolist(),
            "classes": individual_results[0]["classes"],
            "individual_results": individual_results,
        }

        logger.info(
            "ensemble_inference_completed",
            predicted_class=ensemble_result["predicted_class"],
            confidence=confidence,
        )

        return ensemble_result

    async def quantify_uncertainty(
        self,
        model_name: str,
        image: np.ndarray,
        num_samples: int = 10,
    ) -> Dict[str, Any]:
        """
        Quantify prediction uncertainty using Monte Carlo Dropout

        Args:
            model_name: Name of the model to use
            image: Input image
            num_samples: Number of MC samples

        Returns:
            Uncertainty quantification results
        """
        logger.info("quantifying_uncertainty", model_name=model_name, num_samples=num_samples)

        try:
            # Get model
            model = self.model_loader.get_model(model_name)
            if model is None:
                raise ValueError(f"Model not found: {model_name}")

            # Enable dropout
            model.train()

            # Preprocess image
            input_tensor = await self.preprocess_image(image)

            # Run multiple forward passes
            predictions = []
            for _ in range(num_samples):
                with torch.no_grad():
                    output = model(input_tensor)
                    probabilities = F.softmax(output, dim=1)
                    predictions.append(probabilities.cpu().numpy()[0])

            # Back to eval mode
            model.eval()

            predictions_np = np.array(predictions)

            # Calculate statistics
            mean_prediction = predictions_np.mean(axis=0)
            std_prediction = predictions_np.std(axis=0)

            # Epistemic uncertainty (variance of predictions)
            epistemic_uncertainty = float(predictions_np.var(axis=0).mean())

            # Prediction entropy
            mean_log_prob = np.log(mean_prediction + 1e-10)
            entropy = float(-np.sum(mean_prediction * mean_log_prob))

            # Get predicted class
            predicted_class_idx = int(mean_prediction.argmax())
            confidence = float(mean_prediction[predicted_class_idx])

            results = {
                "model_name": model_name,
                "predicted_class_idx": predicted_class_idx,
                "confidence": confidence,
                "mean_probabilities": mean_prediction.tolist(),
                "std_probabilities": std_prediction.tolist(),
                "epistemic_uncertainty": epistemic_uncertainty,
                "prediction_entropy": entropy,
                "num_samples": num_samples,
            }

            logger.info(
                "uncertainty_quantified",
                epistemic_uncertainty=epistemic_uncertainty,
                entropy=entropy,
            )

            return results

        except Exception as e:
            logger.error("uncertainty_quantification_failed", error=str(e))
            raise

    async def calculate_triage_priority(self, inference_result: Dict[str, Any]) -> str:
        """
        Calculate triage priority based on inference results

        Args:
            inference_result: Inference results

        Returns:
            Triage priority: critical, urgent, routine, normal
        """
        confidence = inference_result.get("confidence", 0.0)
        predicted_class = inference_result.get("predicted_class", "")

        # Critical conditions (require immediate attention)
        critical_conditions = [
            "Pneumothorax",
            "Pneumonia",
            "COVID-19",
            "Mass",
            "Nodule",
        ]

        # Urgent conditions
        urgent_conditions = [
            "Cardiomegaly",
            "Effusion",
            "Consolidation",
            "Edema",
        ]

        if any(cond in predicted_class for cond in critical_conditions) and confidence > 0.7:
            return "critical"
        elif any(cond in predicted_class for cond in urgent_conditions) and confidence > 0.6:
            return "urgent"
        elif "Normal" in predicted_class:
            return "normal"
        else:
            return "routine"

    async def generate_clinical_findings(self, inference_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate clinical findings from inference results

        Args:
            inference_result: Inference results

        Returns:
            Clinical findings
        """
        predicted_class = inference_result.get("predicted_class", "")
        confidence = inference_result.get("confidence", 0.0)
        multi_label = inference_result.get("multi_label_predictions", [])

        # Generate abnormalities list
        abnormalities = []
        for pred in multi_label:
            if pred["label"] != "Normal" and pred["probability"] > 0.5:
                abnormalities.append(pred["label"])

        # Determine severity
        if confidence > 0.9 and any(c in predicted_class for c in ["Pneumothorax", "COVID-19"]):
            severity = "severe"
        elif confidence > 0.7:
            severity = "moderate"
        else:
            severity = "mild"

        # Generate recommendations
        recommendations = []
        if "Pneumonia" in predicted_class or "COVID-19" in predicted_class:
            recommendations.append("Immediate clinical correlation recommended")
            recommendations.append("Consider follow-up imaging in 7-14 days")
        elif "Mass" in predicted_class or "Nodule" in predicted_class:
            recommendations.append("Recommend dedicated CT scan")
            recommendations.append("Consider biopsy for definitive diagnosis")
        elif len(abnormalities) > 0:
            recommendations.append("Follow-up imaging in 3-6 months")

        findings = {
            "abnormalities": abnormalities,
            "severity": severity,
            "recommendations": recommendations,
            "confidence_level": "high" if confidence > 0.9 else "medium" if confidence > 0.7 else "low",
        }

        return findings
