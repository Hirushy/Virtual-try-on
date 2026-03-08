# fit_analyzer.py

from sizechart import get_size_measurements


"""
===========================================================
Fit Analyzer
Compares avatar body measurements with clothing size chart
and produces zone-level fit analysis.
===========================================================
"""


def clamp(value, min_value, max_value):
    """
    Restrict a value between min and max.
    """
    return max(min_value, min(value, max_value))


def analyze_zone(name, body_value, cloth_value):
    """
    Analyze a single body zone and return fit evaluation.
    """

    # Prevent invalid numbers
    body_value = body_value or 0
    cloth_value = cloth_value or 0

    # Difference
    # Negative = cloth smaller than body → tight
    # Positive = cloth bigger than body → loose
    diff = cloth_value - body_value

    abs_diff = abs(diff)

    """
    Score Calculation
    0 = very bad fit
    100 = perfect fit
    """

    score = 100 - (abs_diff * 8)

    score = clamp(score, 0, 100)

    """
    Fit classification
    """

    type_label = "good"
    status_label = "Good Fit"

    if diff < -2:
        type_label = "tight"
        status_label = "Too Tight"

    elif diff > 2:
        type_label = "loose"
        status_label = "Too Loose"

    """
    Confidence estimation
    """

    confidence = 0.90

    if abs_diff > 5:
        confidence = 0.85

    if abs_diff > 10:
        confidence = 0.80

    """
    Descriptions for UI
    """

    descriptions = {
        "Shoulders": "Evaluates tension across shoulder seams.",
        "Upper Chest": "Measures chest expansion space and garment tension.",
        "Torso": "Checks waist and torso comfort zone.",
        "Collar": "Analyzes collar pressure around the neck.",
        "Neck Base": "Measures base neck clearance."
    }

    return {
        "name": name,
        "score": round(score, 2),
        "type": type_label,
        "diff": round(diff, 2),
        "statusLabel": status_label,
        "confidence": confidence,
        "desc": descriptions.get(name, "")
    }


"""
===========================================================
Main Fit Analysis Function
===========================================================
"""


def analyze_fit(body_measurements, selected_size):
    """
    Compare avatar body measurements with clothing size chart.
    """

    cloth_measurements = get_size_measurements(selected_size)

    if not cloth_measurements:
        return []

    """
    Zone Mapping
    """

    zone_map = [
        ("Shoulders", "shoulders"),
        ("Upper Chest", "chest"),
        ("Torso", "waist"),
        ("Collar", "neck"),
        ("Neck Base", "neck")
    ]

    zones = []

    for zone_name, measurement_key in zone_map:

        body_value = body_measurements.get(measurement_key, 0)
        cloth_value = cloth_measurements.get(measurement_key, 0)

        zones.append(
            analyze_zone(
                zone_name,
                body_value,
                cloth_value
            )
        )

    return zones