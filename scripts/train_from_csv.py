import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier
import os

CSV_FILE = "photo_training_data.csv"

def train_now():
    if not os.path.exists(CSV_FILE):
        print(f"❌ Error: {CSV_FILE} not found. Save your Excel as CSV first!")
        return

    print(f"📂 Loading data from {CSV_FILE}...")
    df = pd.read_csv(CSV_FILE)
    
    # Check if we have the 5 standard features
    required = ['chest', 'waist', 'hips', 'c_w_ratio', 'w_h_ratio']
    for col in required:
        if col not in df.columns:
            print(f"⚠️ Missing column: {col}. Checking if I can calculate it...")
            if 'chest' in df.columns and 'waist' in df.columns:
                df['c_w_ratio'] = df['chest'] / df['waist']
            if 'waist' in df.columns and 'hips' in df.columns:
                df['w_h_ratio'] = df['waist'] / df['hips']

    # --- FEMALE ---
    df_f = df[df['gender'] == 'F']
    if not df_f.empty:
        X_f = df_f[required].values
        y_f = df_f['size'].values
        clf_f = RandomForestClassifier(n_estimators=100)
        clf_f.fit(X_f, y_f)
        with open("photo_size_model_female.pkl", "wb") as f:
            pickle.dump(clf_f, f)
        print("✅ Success: photo_size_model_female.pkl updated!")

    # --- MALE ---
    df_m = df[df['gender'] == 'M']
    if not df_m.empty:
        X_m = df_m[required].values
        y_m = df_m['size'].values
        clf_m = RandomForestClassifier(n_estimators=100)
        clf_m.fit(X_m, y_m)
        with open("photo_size_model_male.pkl", "wb") as f:
            pickle.dump(clf_m, f)
        print("✅ Success: photo_size_model_male.pkl updated!")

if __name__ == "__main__":
    train_now()
