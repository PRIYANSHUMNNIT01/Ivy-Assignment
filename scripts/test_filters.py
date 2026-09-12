import json
import urllib.request
import urllib.parse
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

def query(endpoint, params, token):
    url = f"{BASE_URL}{endpoint}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(
        url,
        headers={"X-API-Key": API_KEY, "Authorization": f"Bearer {token}"}
    )
    with urllib.request.urlopen(req, context=ctx) as r:
        return json.loads(r.read())

def main():
    token = get_token()
    print("Baseline listings count:", query("/v1/listings", {"limit": 1}, token)["total"])

    # Test filters
    tests = [
        ("bhk=2", {"bhk": 2}),
        ("bedroom=2", {"bedroom": 2}),
        ("locality=adyar", {"locality": "adyar"}),
        ("locality=Adyar (capitalized)", {"locality": "Adyar"}),
        ("property_type=apartment", {"property_type": "apartment"}),
        ("min_price=10000000", {"min_price": 10000000}),
        ("max_price=5000000", {"max_price": 5000000}),
        ("furnishing=semi-furnished", {"furnishing": "semi-furnished"}),
        ("project_id=P40244", {"project_id": "P40244"}),
        ("sort_by=price&order=desc", {"sort_by": "price", "order": "desc"}),
        ("sort_by=price&order=asc", {"sort_by": "price", "order": "asc"}),
        ("sort_by=carpet_area", {"sort_by": "carpet_area"}),
        ("is_live=true", {"is_live": "true"}),
        ("is_live=false", {"is_live": "false"}),
    ]

    for name, params in tests:
        p = {"limit": 5}
        p.update(params)
        res = query("/v1/listings", p, token)
        first_vals = []
        for r in res.get("results", []):
            first_vals.append({
                "id": r.get("listing_id"),
                "bhk": r.get("bedroom"),
                "loc": r.get("locality"),
                "price": r.get("price"),
                "proj": r.get("project_id"),
                "live": r.get("is_live")
            })
        print(f"\nFilter: {name}")
        print(f"  total: {res.get('total')}, returned count: {len(res.get('results', []))}")
        print(f"  first items: {first_vals[:2]}")

if __name__ == "__main__":
    main()
