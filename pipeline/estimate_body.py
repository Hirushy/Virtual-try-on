import json
import math

# Load landmarks
with open("landmarks.json", "r") as f:
    landmarks = json.load(f)

def distance(p1, p2):
    try:
        return math.sqrt((p1['x']-p2['x'])**2 + (p1['y']-p2['y'])**2)
    except:
        return 0

front = landmarks.get("front") or []

# Safe calculations
shoulder_width = distance(front[11], front[12]) if len(front) > 12 else 0
waist_width = distance(front[23], front[24]) if len(front) > 24 else 0
hip_width = distance(front[25], front[26]) if len(front) > 26 else 0
arm_length = distance(front[11], front[15]) if len(front) > 15 else 0
leg_length = distance(front[27], front[31]) if len(front) > 31 else 0
height = distance(front[0], front[31]) if len(front) > 31 else 0

body_measurements = {
    "shoulder_width": shoulder_width,
    "waist_width": waist_width,
    "hip_width": hip_width,
    "arm_length": arm_length,
    "leg_length": leg_length,
    "height": height
}

# Save to JSON for Step 5
with open("body_proportions.json", "w") as f:
    json.dump({"front": body_measurements}, f, indent=4)

print("✅ body_proportions.json created safely!")
