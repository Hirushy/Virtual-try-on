# sizechart.py
# Clothing size reference used for fit analysis

"""
===========================================================
Garment Size Chart (Base Measurements)
All measurements are in centimeters
===========================================================
"""

SIZE_CHART = {
    "XS": {
        "shoulders": 38,
        "chest": 82,
        "waist": 68,
        "neck": 34
    },
    "S": {
        "shoulders": 40,
        "chest": 86,
        "waist": 72,
        "neck": 35
    },
    "M": {
        "shoulders": 42,
        "chest": 92,
        "waist": 78,
        "neck": 37
    },
    "L": {
        "shoulders": 44,
        "chest": 98,
        "waist": 84,
        "neck": 39
    },
    "XL": {
        "shoulders": 46,
        "chest": 104,
        "waist": 90,
        "neck": 41
    },
    "XXL": {
        "shoulders": 48,
        "chest": 110,
        "waist": 96,
        "neck": 43
    }
}


"""
===========================================================
Utility Functions
===========================================================
"""


def get_size_measurements(size: str):
    """
    Return clothing measurements for a given size.

    Parameters
    ----------
    size : str
        Clothing size (XS, S, M, L, XL, XXL)

    Returns
    -------
    dict or None
        Measurement dictionary if size exists
    """

    if not size:
        return None

    size = size.upper()

    measurements = SIZE_CHART.get(size)

    if not measurements:
        return None

    # Return a copy to avoid accidental mutation
    return measurements.copy()


def get_available_sizes():
    """
    Return list of supported clothing sizes.
    """
    return list(SIZE_CHART.keys())


def is_valid_size(size: str):
    """
    Validate if size exists in chart.
    """
    if not size:
        return False

    return size.upper() in SIZE_CHART