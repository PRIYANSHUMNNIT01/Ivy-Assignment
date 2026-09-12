import json
import os
import re
from collections import Counter, defaultdict

DATA_DIR = "/Users/priyanshu_kumar/.gemini/antigravity/scratch/ivy-homes-chennai/data/raw"
with open(os.path.join(DATA_DIR, "listings.json"), "r") as f:
    listings = json.load(f)["results"]

print("==================================================")
print("COMPREHENSIVE AUDIT OF AGENT CONTACTS & NUMBERS")
print("==================================================")

# 1. Phone number formatting:
# In India, mobile numbers are +91 followed by 10 digits.
phone_format_issues = []
for l in listings:
    phone = l.get("posted_by_contact", "")
    # Check regex: ^\+91[0-9]{10}$
    if not re.match(r"^\+91[0-9]{10}$", phone):
        phone_format_issues.append((l["listing_id"], phone))

print(f"Listings with invalid phone format: {len(phone_format_issues)}")
for lid, p in phone_format_issues:
    print(f"  {lid}: {p}")

# 2. Check for unreachable / dummy phone patterns:
# e.g. repeating digits, sequential digits, 000000, 123456
dummy_phones = []
for l in listings:
    phone = l.get("posted_by_contact", "")
    digits = phone.replace("+91", "")
    # Check if all same digit or pattern
    if len(set(digits)) <= 2 or digits == "1234567890" or "000000" in digits or "111111" in digits:
        dummy_phones.append((l["listing_id"], phone, digits, l["posted_by_name"]))

print(f"\nListings with dummy phone digits: {len(dummy_phones)}")
for lid, p, d, name in dummy_phones:
    print(f"  {lid}: {p} ({name})")

# 3. Check agent names:
# Are there any agent names that indicate fake/spam?
name_counts = Counter(l.get("posted_by_name") for l in listings)
agent_issues = []
for l in listings:
    name = l.get("posted_by_name", "").lower()
    if any(w in name for w in ["test", "fake", "demo", "sample", "admin", "agent", "dummy", "bot"]):
        agent_issues.append((l["listing_id"], l["posted_by_name"]))

print(f"\nListings with suspicious agent name: {len(agent_issues)}")
for lid, name in agent_issues:
    print(f"  {lid}: {name}")

# 4. Check email / url / website anomalies:
url_issues = []
for l in listings:
    url = l.get("listing_url", "")
    lid = l["listing_id"]
    # Check if id in URL matches listing_id
    num_part = lid.split("-")[-1]
    if num_part not in url:
        url_issues.append((lid, url))
print(f"\nListings with URL mismatch: {len(url_issues)}")
for lid, url in url_issues[:10]:
    print(f"  {lid}: {url}")

# 5. Check 'posted_by':
posted_by_counts = Counter(l.get("posted_by") for l in listings)
print(f"\nposted_by counts: {posted_by_counts}")

# 6. Check price anomalies in relation to BHK:
# For each BHK (1, 2, 3, 4, 5), check price distribution
print("\nPrice statistics by BHK (excluding negative prices):")
for bhk in range(1, 6):
    bhk_listings = [l for l in listings if l.get("bedroom") == bhk and l.get("price", 0) > 0]
    bhk_prices = sorted(l["price"] for l in bhk_listings)
    if bhk_prices:
        q0 = bhk_prices[0]
        q10 = bhk_prices[int(0.05 * len(bhk_prices))]
        q50 = bhk_prices[len(bhk_prices) // 2]
        q95 = bhk_prices[int(0.95 * len(bhk_prices))]
        q100 = bhk_prices[-1]
        print(f"  {bhk} BHK ({len(bhk_listings)} listings): min={q0:,}, p5={q10:,}, med={q50:,}, p95={q95:,}, max={q100:,}")

# 7. Check the 9 cheap listings again:
# What are their BHKs?
# DWE-4000745: 3 BHK, 9,430
# 100-4001961: 2 BHK, 7,240
# SQU-4001342: 4 BHK, 15,310
# MAG-4000870: 4 BHK, 16,320
# 100-4001484: 4 BHK, 14,140
# MAG-4001467: 3 BHK, 15,530
# MAG-4002092: 3 BHK, 12,260
# MAG-4000075: 4 BHK, 10,950
# ZER-4002683: 2 BHK, 6,470
# Every single one of these 9 has a price that is 0.1% of the actual price (e.g. 6,470 instead of 6,470,000)!
# That is 1000x cheaper! In Indian real estate search portals, this is the classic "honeypot lead generation" trick:
# An agent lists a 2 BHK apartment for Rs 6,470 (entering rent instead of sale price or deliberately entering 6470) so their listing appears at the very top when users sort by "Price: Low to High"!
# Remember earlier when we tested `sort_by=price&order=asc` against the live API?
# The negative price listings came first, followed immediately by these exact listings!
