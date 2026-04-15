import requests

def test_apps_me():
    url = "http://localhost:8000/apps/me"
    try:
        # No token - should return 401 (or 422 if my theory about FastAPI validation is wrong)
        resp = requests.get(url)
        print(f"Status Code (No Token): {resp.status_code}")
        print(f"Response Body: {resp.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_apps_me()
