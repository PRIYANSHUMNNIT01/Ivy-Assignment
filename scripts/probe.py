import json
import urllib.request
import urllib.error
import ssl

BASE_URL = "https://solve.ivy.homes"
API_KEY = "IVY26-FF1DA1A6D2AB"

ctx = ssl.create_default_context()

def test_request(method, path, data=None, headers=None):
    url = f"{BASE_URL}{path}"
    req_headers = {"User-Agent": "Mozilla/5.0"}
    if headers:
        req_headers.update(headers)
    
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        req_headers["Content-Type"] = "application/json"
    
    print(f"\n---> {method} {url}")
    print(f"Headers: {req_headers}")
    if data:
        print(f"Body: {data}")
    
    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            resp_headers = dict(resp.getheaders())
            print(f"<--- Status: {status}")
            print(f"Response headers: {resp_headers}")
            try:
                parsed = json.loads(content)
                print(f"JSON response (sample): {json.dumps(parsed, indent=2)[:500]}")
                return status, parsed, resp_headers
            except Exception:
                print(f"Raw response: {content[:500]}")
                return status, content, resp_headers
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"<--- HTTPError {e.code}: {err_body}")
        try:
            return e.code, json.loads(err_body), dict(e.headers)
        except Exception:
            return e.code, err_body, dict(e.headers)
    except Exception as e:
        print(f"<--- Exception: {type(e).__name__}: {e}")
        return None, str(e), {}

if __name__ == "__main__":
    print("=== 1. Testing Health ===")
    test_request("GET", "/health")

    print("\n=== 2. Testing Auth Login Variants ===")
    # Variant A: POST /auth/login with api_key in query param
    test_request("POST", f"/auth/login?api_key={API_KEY}", 
                 data={"email": "demo1@ivy.homes", "password": "cfd53b6dd0"})
    
    # Variant B: POST /auth/login with api_key in header x-api-key
    test_request("POST", "/auth/login", 
                 data={"email": "demo1@ivy.homes", "password": "cfd53b6dd0"},
                 headers={"x-api-key": API_KEY})

    # Variant C: POST /auth/login without api_key
    status, res, _ = test_request("POST", "/auth/login", 
                 data={"email": "demo1@ivy.homes", "password": "cfd53b6dd0"})

    token = None
    if isinstance(res, dict) and "token" in res:
        token = res["token"]
        print(f"\nAcquired Token: {token[:20]}...")
    elif isinstance(res, dict) and "access_token" in res:
        token = res["access_token"]
        print(f"\nAcquired access_token: {token[:20]}...")

    print("\n=== 3. Testing Listings Endpoint ===")
    # Try with api_key only
    test_request("GET", f"/v1/listings?api_key={API_KEY}&page=1&limit=2")

    # Try with api_key in header
    test_request("GET", "/v1/listings?page=1&limit=2", headers={"x-api-key": API_KEY})

    # If token exists, try with Bearer token
    if token:
        test_request("GET", f"/v1/listings?api_key={API_KEY}&page=1&limit=2", 
                     headers={"Authorization": f"Bearer {token}"})
        test_request("GET", "/v1/listings?page=1&limit=2", 
                     headers={"Authorization": f"Bearer {token}"})
