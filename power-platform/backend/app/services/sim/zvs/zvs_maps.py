"""ZVS map generation and visualization."""
import numpy as np
from typing import Dict, List, Tuple
import json


def generate_zvs_heatmap(
    zvs_boundary: Dict[str, np.ndarray],
    save_path: str = None
) -> Dict[str, any]:
    """
    Generate ZVS heatmap data for visualization.

    Args:
        zvs_boundary: ZVS boundary data from zvs_solver
        save_path: Optional path to save JSON data

    Returns:
        Dictionary with heatmap data ready for Plotly
    """
    heatmap_data = {
        "x": zvs_boundary["phi_deg"].tolist(),
        "y": zvs_boundary["load_percent"].tolist(),
        "z": zvs_boundary["zvs_map"].tolist(),
        "type": "heatmap",
        "colorscale": [
            [0, "rgb(220, 38, 38)"],  # Red for hard switching
            [0.5, "rgb(251, 191, 36)"],  # Yellow for partial
            [1, "rgb(34, 197, 94)"]  # Green for ZVS
        ],
        "colorbar": {
            "title": "ZVS Status",
            "tickvals": [0, 0.5, 1],
            "ticktext": ["Hard Switch", "Partial", "ZVS"]
        }
    }

    margin_map_data = {
        "x": zvs_boundary["phi_deg"].tolist(),
        "y": zvs_boundary["load_percent"].tolist(),
        "z": zvs_boundary["margin_map"].tolist(),
        "type": "heatmap",
        "colorscale": "RdYlGn",
        "colorbar": {
            "title": "ZVS Margin (%)"
        }
    }

    result = {
        "zvs_heatmap": heatmap_data,
        "margin_heatmap": margin_map_data,
        "layout": {
            "title": "Zero-Voltage Switching Operating Region",
            "xaxis": {
                "title": "Phase Shift (degrees)"
            },
            "yaxis": {
                "title": "Load (%)"
            },
            "width": 800,
            "height": 600
        }
    }

    if save_path:
        with open(save_path, 'w') as f:
            json.dump(result, f)

    return result


def extract_zvs_regions(zvs_map: np.ndarray) -> Dict[str, List[Tuple[float, float]]]:
    """
    Extract ZVS and non-ZVS regions from map.

    Args:
        zvs_map: 2D array of ZVS status (0 or 1)

    Returns:
        Dictionary with region boundaries
    """
    zvs_region = []
    hard_switch_region = []

    rows, cols = zvs_map.shape

    for i in range(rows):
        for j in range(cols):
            if zvs_map[i, j] > 0.5:
                zvs_region.append((i, j))
            else:
                hard_switch_region.append((i, j))

    return {
        "zvs_points": zvs_region,
        "hard_switch_points": hard_switch_region,
        "zvs_coverage_percent": (len(zvs_region) / (rows * cols)) * 100
    }


def recommend_operating_points(
    zvs_boundary: Dict[str, np.ndarray],
    target_load_percent: float = 100.0
) -> List[Dict[str, float]]:
    """
    Recommend operating points with good ZVS at target load.

    Args:
        zvs_boundary: ZVS boundary data
        target_load_percent: Target load percentage

    Returns:
        List of recommended operating points
    """
    phi_deg = zvs_boundary["phi_deg"]
    load_percent = zvs_boundary["load_percent"]
    zvs_map = zvs_boundary["zvs_map"]
    margin_map = zvs_boundary["margin_map"]

    # Find closest load index
    load_idx = np.argmin(np.abs(load_percent - target_load_percent))

    recommendations = []

    # Find all ZVS points at this load
    for i, phi in enumerate(phi_deg):
        if zvs_map[load_idx, i] > 0.5:
            recommendations.append({
                "phi_deg": float(phi),
                "load_percent": float(load_percent[load_idx]),
                "zvs_margin": float(margin_map[load_idx, i]),
                "rating": "Excellent" if margin_map[load_idx, i] > 50 else "Good"
            })

    # Sort by margin (best first)
    recommendations.sort(key=lambda x: x["zvs_margin"], reverse=True)

    return recommendations[:5]  # Return top 5
