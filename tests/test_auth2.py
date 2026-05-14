import requests

base = "http://127.0.0.1:8001"
try:
    print("Testing /google-login...")
    r = requests.post(f"{base}/google-login", json={"tokenId": "abc"})
    print(r.status_code, r.text)

    print("\nTesting /pin-login (unregistered)...")
    r = requests.post(f"{base}/pin-login", json={"email": "nobody@test.com", "pin": "0000"})
    print(r.status_code, r.text)

    print("\nTesting /register...")
    r = requests.post(f"{base}/register", json={"email": "someone@test.com", "password": "abc", "pin": "1234"})
    print(r.status_code, r.text)

    print("\nTesting /pin-login (registered)...")
    r = requests.post(f"{base}/pin-login", json={"email": "someone@test.com", "pin": "1234"})
    print(r.status_code, r.text)

except Exception as e:
    print("Error:", e)
