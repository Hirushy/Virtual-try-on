# fit_analyzer.py
# Core fit analysis logic – compares body measurements with garment size chart

from core.sizechart import get_size_measurements


def clamp(value: float, min_val: float, max_val: float) -> float:
    """Limit a value between min and max."""
    return max(min_val, min(value, max_val))


def analyze_zone(name: str, body_value: float, cloth_value: float) -> dict:
    """
    Analyze a single body zone (chest, waist, etc.)
    """

    body_value = body_value or 0
    cloth_value = cloth_value or 0

    # Difference between cloth and body
    diff = cloth_value - body_value
    abs_diff = abs(diff)

    # Fit score (0–100)
    score = clamp(100 - (abs_diff * 8), 0, 100)

    # Fit classification
    if diff < -2:
        type_label = "tight"
        status_label = "Too Tight"
    elif diff > 2:
        type_label = "loose"
        status_label = "Too Loose"
    else:
        type_label = "perfect"
        status_label = "Perfect Fit"

    # Confidence score
    confidence = 0.90
    if abs_diff > 5:
        confidence = 0.85
    if abs_diff > 10:
        confidence = 0.80

    descriptions = {
        "Shoulders": "Evaluates tension across shoulder seams.",
        "Upper Chest": "Measures chest expansion space and garment tension.",
        "Torso": "Checks waist and torso comfort zone.",
        "Collar": "Analyzes collar pressure around the neck.",
        "Neck Base": "Measures base neck clearance."
    }

    return {
        "id": name,
        "name": name,
        "score": round(score, 2),
        "type": type_label,
        "diff": round(diff, 2),
        "statusLabel": status_label,
        "confidence": confidence,
        "desc": descriptions.get(name, "")
    }


def analyze_fit(body_measurements: dict, selected_size: str, brand: str = "DEFAULT") -> list:
    """
    Analyze full garment fit across multiple zones
    """

    cloth_measurements = get_size_measurements(selected_size, brand)

    if not cloth_measurements:
        return []

    zone_map = [
        ("Shoulders", "shoulders"),
        ("Upper Chest", "chest"),
        ("Torso", "waist"),
        ("Collar", "neck"),
        ("Neck Base", "neck"),
    ]

    zones = []

    for zone_name, key in zone_map:

        body_value = body_measurements.get(key, 0)
        cloth_value = cloth_measurements.get(key, 0)

        zone = analyze_zone(zone_name, body_value, cloth_value)
        zones.append(zone)

    return zones