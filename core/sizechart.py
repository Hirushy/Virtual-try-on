# sizechart.py
# Brand-specific garment size charts (measurements in cm)

# 💡 Realistic approximations for major brands to power the Heatmap logic.
BRAND_SIZE_CHARTS = {
    "ZARA": {
        "XS":  {"shoulders": 38, "chest": 82,  "waist": 62,  "neck": 35},
        "S":   {"shoulders": 40, "chest": 86,  "waist": 66,  "neck": 36},
        "M":   {"shoulders": 42, "chest": 92,  "waist": 72,  "neck": 37},
        "L":   {"shoulders": 44, "chest": 98,  "waist": 78,  "neck": 39},
        "XL":  {"shoulders": 46, "chest": 104, "waist": 84,  "neck": 41},
    },
    "HM": {
        "XS":  {"shoulders": 39, "chest": 84,  "waist": 64,  "neck": 35},
        "S":   {"shoulders": 41, "chest": 88,  "waist": 68,  "neck": 36},
        "M":   {"shoulders": 43, "chest": 94,  "waist": 74,  "neck": 38},
        "L":   {"shoulders": 45, "chest": 102, "waist": 82,  "neck": 40},
        "XL":  {"shoulders": 48, "chest": 110, "waist": 90,  "neck": 42},
    },
    "ASOS": {
        "XS":  {"shoulders": 37, "chest": 80,  "waist": 60,  "neck": 34},
        "S":   {"shoulders": 39, "chest": 85,  "waist": 65,  "neck": 35},
        "M":   {"shoulders": 41, "chest": 90,  "waist": 70,  "neck": 37},
        "L":   {"shoulders": 43, "chest": 96,  "waist": 78,  "neck": 39},
        "XL":  {"shoulders": 45, "chest": 104, "waist": 86,  "neck": 41},
    },
    # Default chart used if brand is unknown
    "DEFAULT": {
        "XS":  {"shoulders": 40, "chest": 86,  "waist": 72,  "neck": 36},
        "S":   {"shoulders": 42, "chest": 92,  "waist": 78,  "neck": 37},
        "M":   {"shoulders": 45, "chest": 100, "waist": 85,  "neck": 39},
        "L":   {"shoulders": 48, "chest": 108, "waist": 94,  "neck": 41},
        "XL":  {"shoulders": 50, "chest": 116, "waist": 104, "neck": 43},
        "XXL": {"shoulders": 52, "chest": 124, "waist": 112, "neck": 45},
    }
}


def get_size_measurements(size: str, brand: str = "DEFAULT") -> dict:
    """
    Return clothing measurements for a specific size and brand.
    """
    b_key = brand.upper() if brand else "DEFAULT"
    chart = BRAND_SIZE_CHARTS.get(b_key, BRAND_SIZE_CHARTS["DEFAULT"])
    
    s_key = size.upper()
    return chart.get(s_key, chart.get("M"))