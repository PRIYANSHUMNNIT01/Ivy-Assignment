import json
import os
from collections import Counter, defaultdict

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings = json.load(f)["results"]

print("==================================================")
print("1. FULL CORRUPT LISTINGS LIST (Q4)")
print("==================================================")
corrupt = []
for l in listings:
    lid = l["listing_id"]
    p = l.get("price")
    ca = l.get("carpet_area")
    sba = l.get("super_built_up_area")
    fl = l.get("floor")
    tf = l.get("total_floors")
    bhk = l.get("bedroom")
    bath = l.get("bathroom")
    
    issues = []
    if p is not None and p <= 0:
        issues.append(f"price={p}")
    if ca is not None and ca <= 0:
        issues.append(f"carpet_area={ca}")
    if sba is not None and sba <= 0:
        issues.append(f"super_built_up_area={sba}")
    if ca is not None and sba is not None and ca > sba:
        issues.append(f"carpet({ca}) > super_builtup({sba})")
    if fl is not None and tf is not None and fl > tf:
        issues.append(f"floor({fl}) > total_floors({tf})")
    if fl is not None and fl < 0:
        issues.append(f"floor({fl}) < 0")
    if tf is not None and tf <= 0:
        issues.append(f"total_floors({tf}) <= 0")
    if bhk is not None and bhk <= 0:
        issues.append(f"bedroom({bhk}) <= 0")
    if bath is not None and bath <= 0:
        issues.append(f"bathroom({bath}) <= 0")
        
    if issues:
        corrupt.append((lid, issues, l))

print(f"Total corrupt listings: {len(corrupt)}")
for lid, issues, _ in corrupt:
    print(f"  {lid}: {issues}")

corrupt_ids = sorted(list(set(c[0] for c in corrupt)))
print(f"\nFinal sorted corrupt_listing_ids ({len(corrupt_ids)}):")
print(corrupt_ids)

print("\n==================================================")
print("2. INVESTIGATING FAKE LISTINGS (Q9)")
print("==================================================")
# Let's inspect listings with suspicious price (< 1,00,000 INR for buying property)
cheap_listings = [l for l in listings if l.get("price", 0) > 0 and l.get("price", 0) < 1000000]
print(f"Listings with price < 10 Lakhs (1,000,000): {len(cheap_listings)}")
for l in cheap_listings:
    print(f"  {l['listing_id']}: price={l['price']}, bhk={l['bedroom']}, ca={l['carpet_area']}, loc={l['locality']}, apt={l['apartment_name']}, agent={l['posted_by_name']}, phone={l['posted_by_contact']}, website={l['website']}")

# Notice: All normal sales in Chennai are >= 15 Lakhs (1,500,000).
# What about prices < 100,000?
super_cheap = [l for l in listings if 0 < l.get("price", 0) < 100000]
print(f"\nListings with price < 1 Lakh (100,000): {len(super_cheap)}")
for l in super_cheap:
    print(f"  {l['listing_id']}: price={l['price']}, desc={l['description'][:80]}")

# Let's check phone numbers that appear across many different names or websites
phone_to_listings = defaultdict(list)
for l in listings:
    phone = l.get("posted_by_contact")
    if phone:
        phone_to_listings[phone].append(l)

# Let's check if any phone numbers are known fake patterns: e.g. repeating digits like +912000000000 or 12345
suspicious_phones = []
for p in phone_to_listings:
    digits = "".join(filter(str.isdigit, p))
    # Check repeating digits or sequential
    if len(set(digits[4:])) <= 2: # repeating
        suspicious_phones.append((p, digits, len(phone_to_listings[p])))

print(f"\nSuspicious phone numbers by repetition: {suspicious_phones}")

# Let's inspect descriptions for fraud / enquiry generation patterns
# "enquiry", "call now", "urgent", "contact", "below market", "distress", "investor", "owner moving abroad"
fraud_keywords = [
    "owner moving abroad", "priced to sell", "distress sale", "urgent sale",
    "call immediately", "brokerage free", "below market value", "exclusive deal",
    "limited offer", "hurry"
]
kw_matches = defaultdict(list)
for l in listings:
    desc = l.get("description", "").lower()
    for kw in fraud_keywords:
        if kw in desc:
            kw_matches[kw].append(l)

print("\nKeyword match counts in descriptions:")
for kw, lst in kw_matches.items():
    print(f"  '{kw}': {len(lst)} listings")
    if len(lst) < 30:
        for x in lst[:5]:
            print(f"     {x['listing_id']}: price={x['price']}, loc={x['locality']}, desc={x['description'][:70]}")

# Let's check: in statement.md:
# "Some of these listings are not real. They exist to generate enquiries. List their listing_ids, sorted."
# Let's analyze the exact pattern of these fake listings.
