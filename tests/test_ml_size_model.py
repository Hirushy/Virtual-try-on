import pickle
import numpy as np
import os

def test_my_robot_brain():
    print("🤖 --- TESTING YOUR UPGRADED SIZE PREDICTOR ---")
    print("This version uses 5-feature 'Proportional' AI logic.\n")
    
    gender = input("Is the person Male or Female? (M/F): ").strip().upper()
    model_file = "photo_size_model_female.pkl" if gender == "F" else "photo_size_model_male.pkl"
    
    if not os.path.exists(model_file):
        print(f"❌ Error: {model_file} not found. Did you run train_ml_size_model.py first?")
        return

    # Load the brain
    with open(model_file, "rb") as f:
        clf = pickle.load(f)

    print("\nEnter the Width/Height ratios from your console (0 to 1):")
    try:
        s_r = float(input("Shoulder Ratio (e.g. 0.25): "))
        w_r = float(input("Waist Ratio (e.g. 0.22): "))
        h_r = float(input("Hip Ratio (e.g. 0.24): "))
        
        # Calculate the 2 extra ratio features
        c_w = s_r / (w_r if w_r > 0 else 0.1)
        w_h = w_r / (h_r if h_r > 0 else 0.1)
        
        features = np.array([[s_r, w_r, h_r, c_w, w_h]])
        
        print(f"\n🔬 Input Features: {features[0]}")
        
        prediction = clf.predict(features)[0]
        
        print(f"\n✨ THE ROBOT SAYS: This person is size {prediction}!")
        
    except Exception as e:
        print(f"❌ Error: Please enter numbers only. ({e})")

if __name__ == "__main__":
    test_my_robot_brain()
