import requests

base = "http://127.0.0.1:8001"
try:
    print("Testing /register...")
    r = requests.post(f"{base}/register", json={"email": "a@a.com", "password": "pass", "pin": "1234"})
    print(r.status_code, r.text)

    print("\nTesting /pin-login...")
    r = requests.post(f"{base}/pin-login", json={"email": "a@a.com", "pin": "1234"})
    print(r.status_code, r.text)

    print("\nTesting /google-login...")
    r = requests.post(f"{base}/google-login", json={"tokenId": "abcdefg123"})
    print(r.status_code, r.text)

except Exception as e:
    print("Error:", e)
