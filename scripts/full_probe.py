import json
import urllib.request
import urllib.error
import ssl

BASE_URL = "https://solve.ivy.homes"
API_KEY = "IVY26-FF1DA1A6D2AB"
ctx = ssl.create_default_context()

def api_request(method, path, data=None, token=None, headers=None):
    url = f"{BASE_URL}{path}"
    req_headers = {
        "User-Agent": "Mozilla/5.0",
        "X-API-Key": API_KEY,
    }
    if token:
        req_headers["Authorization"] = f"Bearer {token}"
    if headers:
        req_headers.update(headers)
    
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        req_headers["Content-Type"] = "application/json"
    
    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            parsed = json.loads(content)
            return status, parsed, dict(resp.getheaders())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(err_body), dict(e.headers)
        except Exception:
            return e.code, err_body, dict(e.headers)
    except Exception as e:
        return None, str(e), {}

def main():
    print("=== Logging in ===")
    status, auth_data, _ = api_request("POST", "/auth/login", data={"email": "demo1@ivy.homes", "password": "cfd53b6dd0"})
    print(f"Login status: {status}")
    print(f"Auth keys: {list(auth_data.keys()) if isinstance(auth_data, dict) else auth_data}")
    print(f"expires_in: {auth_data.get('expires_in')}")
    print(f"refresh_url: {auth_data.get('refresh_url')}")
    print(f"user: {auth_data.get('user')}")
    
    token = auth_data["access_token"]
    refresh_token = auth_data.get("refresh_token")
    
    print("\n=== Testing /auth/refresh ===")
    r_status, r_data, _ = api_request("POST", "/auth/refresh", data={"refresh_token": refresh_token}, token=token)
    print(f"Refresh status: {r_status}")
    print(f"Refresh response: {r_data}")

    print("\n=== Probing /v1/listings ===")
    # Check limit default and max limit
    for limit in [1, 20, 50, 100, 200, 250, 500]:
        s, d, _ = api_request("GET", f"/v1/listings?page=1&limit={limit}", token=token)
        if s == 200:
            print(f"limit={limit} -> 200 OK, total={d.get('total')}, page_size={d.get('page_size')}, results count={len(d.get('results', []))}")
        else:
            print(f"limit={limit} -> Status {s}: {d}")

    # Inspect first listing object schema
    s, d, _ = api_request("GET", "/v1/listings?page=1&limit=2", token=token)
    if s == 200 and d.get("results"):
        sample = d["results"][0]
        print(f"\nSample listing fields ({len(sample)} fields): {list(sample.keys())}")
        print(f"Sample listing:\n{json.dumps(sample, indent=2)}")

    print("\n=== Probing /v1/rentals ===")
    for limit in [1, 20, 200]:
        s, d, _ = api_request("GET", f"/v1/rentals?page=1&limit={limit}", token=token)
        if s == 200:
            print(f"rentals limit={limit} -> 200 OK, total={d.get('total')}, count={len(d.get('results', []))}")
        else:
            print(f"rentals limit={limit} -> Status {s}: {d}")
    if s == 200 and d.get("results"):
        sample_rental = d["results"][0]
        print(f"Sample rental fields: {list(sample_rental.keys())}")
        print(f"Sample rental:\n{json.dumps(sample_rental, indent=2)}")

    print("\n=== Probing /v1/projects ===")
    for limit in [1, 20, 200]:
        s, d, _ = api_request("GET", f"/v1/projects?page=1&limit={limit}", token=token)
        if s == 200:
            print(f"projects limit={limit} -> 200 OK, total={d.get('total')}, count={len(d.get('results', []))}")
        else:
            print(f"projects limit={limit} -> Status {s}: {d}")
    if s == 200 and d.get("results"):
        sample_proj = d["results"][0]
        print(f"Sample project fields: {list(sample_proj.keys())}")
        print(f"Sample project:\n{json.dumps(sample_proj, indent=2)}")

    print("\n=== Probing /v1/analytics/summary ===")
    s, d, _ = api_request("GET", "/v1/analytics/summary", token=token)
    print(f"analytics status: {s}")
    print(f"analytics response:\n{json.dumps(d, indent=2)}")

    print("\n=== Probing /v1/favourites ===")
    s, d, _ = api_request("GET", "/v1/favourites", token=token)
    print(f"favourites status: {s}")
    print(f"favourites response: {d}")

    print("\n=== Probing Single Listing Endpoints ===")
    # In docs: GET /v1/listing/{listing_id} (singular) vs /v1/listings/{listing_id} (plural)
    first_id = sample["listing_id"]
    s_sing, d_sing, _ = api_request("GET", f"/v1/listing/{first_id}", token=token)
    print(f"GET /v1/listing/{first_id} (singular in docs) -> {s_sing}: {type(d_sing)}")
    s_plur, d_plur, _ = api_request("GET", f"/v1/listings/{first_id}", token=token)
    print(f"GET /v1/listings/{first_id} (plural) -> {s_plur}: {type(d_plur)}")

    print("\n=== Probing Similar Listings ===")
    s_sim, d_sim, _ = api_request("GET", f"/v1/listings/{first_id}/similar", token=token)
    print(f"GET /v1/listings/{first_id}/similar -> {s_sim}: {len(d_sim.get('results', [])) if isinstance(d_sim, dict) else d_sim}")

if __name__ == "__main__":
    main()
