import json
import subprocess
import time

API_KEY = "IVY26-FF1DA1A6D2AB"
BASE_URL = "https://solve.ivy.homes"

def get_token():
    cmd = [
        "curl", "-s", "-X", "POST", f"{BASE_URL}/auth/login",
        "-H", f"X-API-Key: {API_KEY}",
        "-H", "Content-Type: application/json",
        "-d", '{"email":"demo1@ivy.homes","password":"cfd53b6dd0"}'
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    return json.loads(res.stdout)["access_token"]

def find_end(endpoint, start_offset=0):
    token = get_token()
    offset = start_offset
    limit = 50
    total_records = 0
    all_items = []
    server_total_field = None
    
    print(f"\n==========================================")
    print(f"Finding TRUE END of {endpoint} (starting offset={offset})")
    print(f"==========================================")

    while True:
        cmd = [
            "curl", "-s", "-X", "GET", f"{BASE_URL}{endpoint}?offset={offset}&limit={limit}",
            "-H", f"X-API-Key: {API_KEY}",
            "-H", f"Authorization: Bearer {token}"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        try:
            data = json.loads(res.stdout)
        except Exception:
            token = get_token()
            continue
            
        if "detail" in data:
            print(f"Auth or other error: {data}")
            token = get_token()
            continue

        server_total_field = data.get("total")
        results = data.get("results", [])
        has_more = data.get("has_more", False)
        
        all_items.extend(results)
        print(f"Offset {offset:4d} | Got {len(results):2d} items | Accumulated: {len(all_items):4d} | has_more: {has_more} | server total: {server_total_field}")
        
        if not results or not has_more:
            print(f"--> REACHED THE REAL END! Final true total retrievable = {len(all_items)} records!")
            break
            
        offset += len(results)
        time.sleep(0.05)

    return server_total_field, len(all_items), all_items

if __name__ == "__main__":
    t_proj, n_proj, items_proj = find_end("/v1/projects", 0)
    print(f"PROJECTS: server total field = {t_proj}, ACTUAL retrievable = {n_proj}")

    t_rent, n_rent, items_rent = find_end("/v1/rentals", 0)
    print(f"RENTALS: server total field = {t_rent}, ACTUAL retrievable = {n_rent}")

    t_list, n_list, items_list = find_end("/v1/listings", 0)
    print(f"LISTINGS: server total field = {t_list}, ACTUAL retrievable = {n_list}")
