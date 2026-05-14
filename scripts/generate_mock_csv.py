import pandas as pd

data = [
    ["slim_f1.jpg", 0.22, 0.19, 0.21, 1.1579, 0.9048, "S", "F"],
    ["slim_f2.jpg", 0.21, 0.18, 0.20, 1.1667, 0.9000, "S", "F"],
    ["slim_m1.jpg", 0.25, 0.22, 0.23, 1.1364, 0.9565, "S", "M"],
    ["slim_m2.jpg", 0.24, 0.21, 0.22, 1.1429, 0.9545, "S", "M"],
    ["average_f1.jpg", 0.26, 0.24, 0.26, 1.0833, 0.9231, "S-M", "F"],
    ["average_f2.jpg", 0.27, 0.25, 0.27, 1.0800, 0.9259, "S-M", "F"],
    ["average_m1.jpg", 0.29, 0.27, 0.28, 1.0741, 0.9643, "S-M", "M"],
    ["average_m2.jpg", 0.28, 0.26, 0.27, 1.0769, 0.9630, "S-M", "M"],
    ["chubby_f1.jpg", 0.32, 0.30, 0.33, 1.0667, 0.9091, "M-L", "F"],
    ["chubby_f2.jpg", 0.33, 0.31, 0.34, 1.0645, 0.9118, "M-L", "F"],
    ["chubby_m1.jpg", 0.35, 0.33, 0.35, 1.0606, 0.9429, "M-L", "M"],
    ["chubby_m2.jpg", 0.36, 0.34, 0.36, 1.0588, 0.9444, "M-L", "M"],
    ["fat_f1.jpg", 0.40, 0.42, 0.45, 0.9524, 0.9333, "XL", "F"],
    ["fat_f2.jpg", 0.42, 0.45, 0.48, 0.9333, 0.9375, "XL", "F"],
    ["fat_m1.jpg", 0.45, 0.48, 0.50, 0.9375, 0.9600, "XL", "M"],
    ["fat_m2.jpg", 0.44, 0.47, 0.49, 0.9362, 0.9592, "XL", "M"]
]

df = pd.DataFrame(data, columns=["photo_name","chest","waist","hips","c_w_ratio","w_h_ratio","size","gender"])
df.to_csv("photo_training_data_mock.csv", index=False)
print("✅ Created photo_training_data_mock.csv for immediate testing!")
