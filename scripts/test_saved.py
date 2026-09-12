import json
import urllib.request
import urllib.error
import ssl

BASE_URL = "https://solve.ivy.homes"
API_KEY = "IVY26-FF1DA1A6D2AB"
ctx = ssl.create_default_context()

def get_token():
    req = urllib.request.Request(
        f"{BASE_URL}/auth/login",
        data=json.dumps({"email": "demo1@ivy.homes", "password": "cfd53b6dd0"}).encode(),
        headers={"X-API-Key": API_KEY, "Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, context=ctx) as r:
        return json.loads(r.read())["access_token"]

def main():
    token = get_token()
    headers = {"X-API-Key": API_KEY, "Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    print("1. GET /v1/saved")
    req = urllib.request.Request(f"{BASE_URL}/v1/saved", headers=headers)
    with urllib.request.urlopen(req, context=ctx) as r:
        print("GET /v1/saved:", json.loads(r.read()))

    # Test POST /v1/saved with {"listing_id": "MAG-4001518"} vs {"id": "MAG-4001518"}
    # In API docs it documented {"id": "100-1000042"}
    test_id = "MAG-4001518"
    print("\n2. Testing POST /v1/saved with {'id': ...}")
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/v1/saved",
            data=json.dumps({"id": test_id}).encode(),
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req, context=ctx) as r:
            print("POST with id -> Status:", r.status, json.loads(r.read()))
    except urllib.error.HTTPError as e:
        print("POST with id -> HTTPError:", e.code, e.read().decode())

    print("\n3. Testing POST /v1/saved with {'listing_id': ...}")
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/v1/saved",
            data=json.dumps({"listing_id": test_id}).encode(),
            headers=headers,
            method="POST"
        )
        with urllib.request.urlopen(req, context=ctx) as r:
            print("POST with listing_id -> Status:", r.status, json.loads(r.read()))
    except urllib.error.HTTPError as e:
        print("POST with listing_id -> HTTPError:", e.code, e.read().decode())

    # Check GET /v1/saved again
    req = urllib.request.Request(f"{BASE_URL}/v1/saved", headers=headers)
    with urllib.request.urlopen(req, context=ctx) as r:
        print("\nGET /v1/saved after POST:", json.loads(r.read()))

    # Test DELETE
    print(f"\n4. Testing DELETE /v1/saved/{test_id}")
    try:
        req = urllib.request.Request(f"{BASE_URL}/v1/saved/{test_id}", headers=headers, method="DELETE")
        with urllib.request.urlopen(req, context=ctx) as r:
            print("DELETE -> Status:", r.status, r.read().decode())
    except urllib.error.HTTPError as e:
        print("DELETE -> HTTPError:", e.code, e.read().decode())

    # Check GET /v1/saved again
    req = urllib.request.Request(f"{BASE_URL}/v1/saved", headers=headers)
    with urllib.request.urlopen(req, context=ctx) as r:
        print("\nGET /v1/saved after DELETE:", json.loads(r.read()))

if __name__ == "__main__":
    main()
