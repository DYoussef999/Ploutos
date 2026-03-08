import os
import httpx
import asyncio
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/locations", tags=["locations"])

BESTTIME_PRIVATE_KEY = os.getenv("BESTTIME_PRIVATE_KEY")
BESTTIME_FORECAST_URL = "https://besttime.app/api/v1/forecasts"
MAPBOX_TOKEN = os.getenv("MAPBOX_TOKEN")

# ── Real commercial listings ──────────────────────────────────────────────────
# Coordinates are from Mapbox geocoding. geocode_all_listings() refreshes them
# at startup, but these defaults are already accurate.
LISTINGS = [
    {
        "id": 1, "address": "144 King St N, Waterloo, ON",
        "neighbourhood": "Uptown Waterloo",
        "monthly_cost": 4200, "square_footage": 850,
        "latitude": 43.470999, "longitude": -80.523882,
        "besttime_query": {"name": "144 King St N Waterloo", "address": "144 King St N Waterloo ON Canada"},
    },
    {
        "id": 2, "address": "187 King St N, Waterloo, ON",
        "neighbourhood": "Uptown Waterloo",
        "monthly_cost": 5800, "square_footage": 1200,
        "latitude": 43.472932, "longitude": -80.524608,
        "besttime_query": {"name": "187 King St N Waterloo", "address": "187 King St N Waterloo ON Canada"},
    },
    {
        "id": 3, "address": "22 Erb St W, Waterloo, ON",
        "neighbourhood": "Uptown Waterloo",
        "monthly_cost": 6500, "square_footage": 1450,
        "latitude": 43.464355, "longitude": -80.525261,
        "besttime_query": {"name": "22 Erb St W Waterloo", "address": "22 Erb St W Waterloo ON Canada"},
    },
    {
        "id": 4, "address": "75 King St S, Waterloo, ON",
        "neighbourhood": "Uptown Waterloo",
        "monthly_cost": 3900, "square_footage": 780,
        "latitude": 43.463424, "longitude": -80.523406,
        "besttime_query": {"name": "75 King St S Waterloo", "address": "75 King St S Waterloo ON Canada"},
    },
    {
        "id": 5, "address": "51 Erb St E, Waterloo, ON",
        "neighbourhood": "Uptown Waterloo",
        "monthly_cost": 4750, "square_footage": 950,
        "latitude": 43.465630, "longitude": -80.519046,
        "besttime_query": {"name": "51 Erb St E Waterloo", "address": "51 Erb St E Waterloo ON Canada"},
    },
    {
        "id": 6, "address": "314 King St N, Waterloo, ON",
        "neighbourhood": "Near Wilfrid Laurier University",
        "monthly_cost": 2800, "square_footage": 620,
        "latitude": 43.478965, "longitude": -80.525533,
        "besttime_query": {"name": "314 King St N Waterloo", "address": "314 King St N Waterloo ON Canada"},
    },
    {
        "id": 7, "address": "270 King St N, Waterloo, ON",
        "neighbourhood": "Near Wilfrid Laurier University",
        "monthly_cost": 3200, "square_footage": 700,
        "latitude": 43.477325, "longitude": -80.525189,
        "besttime_query": {"name": "270 King St N Waterloo", "address": "270 King St N Waterloo ON Canada"},
    },
    {
        "id": 8, "address": "232 King St N, Waterloo, ON",
        "neighbourhood": "Near Wilfrid Laurier University",
        "monthly_cost": 3550, "square_footage": 760,
        "latitude": 43.475377, "longitude": -80.524337,
        "besttime_query": {"name": "232 King St N Waterloo", "address": "232 King St N Waterloo ON Canada"},
    },
    {
        "id": 9, "address": "180 University Ave W, Waterloo, ON",
        "neighbourhood": "University Corridor",
        "monthly_cost": 2950, "square_footage": 640,
        "latitude": 43.472000, "longitude": -80.536385,
        "besttime_query": {"name": "180 University Ave W Waterloo", "address": "180 University Ave W Waterloo ON Canada"},
    },
    {
        "id": 10, "address": "152 University Ave W, Waterloo, ON",
        "neighbourhood": "University Corridor",
        "monthly_cost": 2600, "square_footage": 580,
        "latitude": 43.472136, "longitude": -80.536021,
        "besttime_query": {"name": "152 University Ave W Waterloo", "address": "152 University Ave W Waterloo ON Canada"},
    },
    {
        "id": 11, "address": "89 Bridgeport Rd E, Waterloo, ON",
        "neighbourhood": "Bridgeport",
        "monthly_cost": 2200, "square_footage": 520,
        "latitude": 43.469492, "longitude": -80.513335,
        "besttime_query": {"name": "89 Bridgeport Rd E Waterloo", "address": "89 Bridgeport Rd E Waterloo ON Canada"},
    },
    {
        "id": 12, "address": "135 Bridgeport Rd E, Waterloo, ON",
        "neighbourhood": "Bridgeport",
        "monthly_cost": 2450, "square_footage": 560,
        "latitude": 43.470850, "longitude": -80.510221,
        "besttime_query": {"name": "135 Bridgeport Rd E Waterloo", "address": "135 Bridgeport Rd E Waterloo ON Canada"},
    },
    {
        "id": 13, "address": "410 King St N, Waterloo, ON",
        "neighbourhood": "North King",
        "monthly_cost": 3100, "square_footage": 680,
        "latitude": 43.484759, "longitude": -80.526322,
        "besttime_query": {"name": "410 King St N Waterloo", "address": "410 King St N Waterloo ON Canada"},
    },
    {
        "id": 14, "address": "450 King St N, Waterloo, ON",
        "neighbourhood": "North King",
        "monthly_cost": 3350, "square_footage": 720,
        "latitude": 43.487645, "longitude": -80.526294,
        "besttime_query": {"name": "450 King St N Waterloo", "address": "450 King St N Waterloo ON Canada"},
    },
    {
        "id": 15, "address": "18 William St W, Waterloo, ON",
        "neighbourhood": "Near Wilfrid Laurier University",
        "monthly_cost": 2750, "square_footage": 600,
        "latitude": 43.460154, "longitude": -80.523023,
        "besttime_query": {"name": "18 William St W Waterloo", "address": "18 William St W Waterloo ON Canada"},
    },
    {
        "id": 16, "address": "44 Noecker St, Waterloo, ON",
        "neighbourhood": "Uptown Fringe",
        "monthly_cost": 2100, "square_footage": 490,
        "latitude": 43.471834, "longitude": -80.521150,
        "besttime_query": {"name": "44 Noecker St Waterloo", "address": "44 Noecker St Waterloo ON Canada"},
    },
    {
        "id": 17, "address": "11 Willow St W, Waterloo, ON",
        "neighbourhood": "Uptown Fringe",
        "monthly_cost": 1950, "square_footage": 460,
        "latitude": 43.465161, "longitude": -80.518066,
        "besttime_query": {"name": "11 Willow St W Waterloo", "address": "11 Willow St W Waterloo ON Canada"},
    },
    {
        "id": 18, "address": "320 Albert St, Waterloo, ON",
        "neighbourhood": "University Corridor",
        "monthly_cost": 2850, "square_footage": 630,
        "latitude": 43.477864, "longitude": -80.534700,
        "besttime_query": {"name": "320 Albert St Waterloo", "address": "320 Albert St Waterloo ON Canada"},
    },
    {
        "id": 19, "address": "88 Regina St N, Waterloo, ON",
        "neighbourhood": "Uptown Fringe",
        "monthly_cost": 2300, "square_footage": 510,
        "latitude": 43.469637, "longitude": -80.522330,
        "besttime_query": {"name": "88 Regina St N Waterloo", "address": "88 Regina St N Waterloo ON Canada"},
    },
    {
        "id": 20, "address": "500 King St N, Waterloo, ON",
        "neighbourhood": "North King",
        "monthly_cost": 3600, "square_footage": 800,
        "latitude": 43.491352, "longitude": -80.526462,
        "besttime_query": {"name": "500 King St N Waterloo", "address": "500 King St N Waterloo ON Canada"},
    },
]

# Neighbourhood-level fallback hourly patterns if BestTime fails
NEIGHBOURHOOD_FALLBACK = {
    "Uptown Waterloo":                 [5,5,5,5,5,5,10,20,35,45,55,65,70,65,60,65,70,80,90,85,75,60,40,15],
    "Near Wilfrid Laurier University": [5,5,5,5,5,5,10,30,70,85,80,75,60,55,75,80,70,50,40,30,20,15,10,5],
    "University Corridor":             [5,5,5,5,5,5,10,25,65,80,75,70,55,50,70,75,65,45,35,25,15,10,8,5],
    "Bridgeport":                      [3,3,3,3,3,5,10,20,40,55,60,65,60,55,50,45,40,35,30,20,12,8,5,3],
    "North King":                      [3,3,3,3,3,5,10,20,35,50,60,65,65,60,55,50,45,40,35,25,15,10,5,3],
    "Uptown Fringe":                   [3,3,3,3,3,5,8,15,30,40,50,55,60,55,50,45,40,38,42,40,30,20,12,5],
}
DEFAULT_FALLBACK = [5,5,5,5,5,8,12,20,35,50,60,65,65,60,58,55,50,48,45,35,25,15,8,5]


# ── Geocode all listings at startup using Mapbox ─────────────────────────────
async def geocode_one(client: httpx.AsyncClient, address: str):
    """Geocode a single address. Tries POI-level first (building coords),
    then falls back to general search. Returns (lat, lng) or None."""
    base_url = f"https://api.mapbox.com/geocoding/v5/mapbox.places/{address}.json"

    # Pass 1: try POI + address — POI results sit on the building, not the street
    for types in ["poi,address", "address", None]:
        params = {
            "access_token": MAPBOX_TOKEN,
            "limit": 5,
            "country": "CA",
            "proximity": "-80.5230,43.4700",  # bias toward Waterloo core
        }
        if types:
            params["types"] = types

        resp = await client.get(base_url, params=params, timeout=10.0)
        data = resp.json()
        features = data.get("features", [])

        if features:
            # Prefer the feature whose place_name best matches our address
            best = features[0]
            for f in features:
                pn = f.get("place_name", "").lower()
                # Simple heuristic: if the street number appears in the result, prefer it
                street_num = address.split(" ")[0]
                if street_num in pn:
                    best = f
                    break

            lng, lat = best["center"]
            result_type = best.get("place_type", ["?"])[0]
            return lat, lng, result_type

    return None


async def geocode_all_listings():
    """Hit Mapbox Geocoding API for each listing address to get precise lat/lng.
    Tries POI-level first (returns building coords), falls back to address-level.
    Runs once at backend startup."""
    if not MAPBOX_TOKEN:
        print("⚠️  MAPBOX_TOKEN not set — skipping geocoding, using default coordinates")
        return

    print(f"🌍 Geocoding {len(LISTINGS)} listings via Mapbox...")
    async with httpx.AsyncClient() as client:
        for listing in LISTINGS:
            try:
                address = listing["address"]
                result = await geocode_one(client, address)
                if result:
                    lat, lng, result_type = result
                    listing["latitude"] = lat
                    listing["longitude"] = lng
                    icon = "📍" if result_type == "poi" else "✅"
                    print(f"  {icon} {address} → {lat:.6f}, {lng:.6f} ({result_type})")
                else:
                    print(f"  ⚠️  No results for {address} — keeping default coords")
            except Exception as e:
                print(f"  ❌ Geocoding failed for {listing['address']}: {e}")

    print("🌍 Geocoding complete.")


async def prefetch_besttime():
    """Pre-fetch BestTime foot traffic for all neighbourhoods at startup.
    This warms the cache so user searches are instant."""
    if not BESTTIME_PRIVATE_KEY:
        print("⚠️  BESTTIME_PRIVATE_KEY not set — skipping foot traffic prefetch")
        return

    # Get unique neighbourhoods
    neighbourhoods = list({l["neighbourhood"] for l in LISTINGS})
    print(f"🚶 Pre-fetching foot traffic for {len(neighbourhoods)} neighbourhoods...")

    async with httpx.AsyncClient() as client:
        for neighbourhood in neighbourhoods:
            # Pick the first listing in this neighbourhood as a starting point
            sample = next(l for l in LISTINGS if l["neighbourhood"] == neighbourhood)
            await fetch_besttime_hourly(client, sample)

    cached = sum(1 for n in neighbourhoods if n in _neighbourhood_cache)
    print(f"🚶 Foot traffic prefetch complete — {cached}/{len(neighbourhoods)} neighbourhoods cached.")


# ── BestTime foot traffic ────────────────────────────────────────────────────

# Popular nearby venues per neighbourhood that BestTime will have data for.
# These act as foot traffic proxies — a busy café next door tells you more
# about the area's foot traffic than an empty commercial listing.
NEIGHBOURHOOD_PROXIES = {
    "Uptown Waterloo": [
        {"name": "Starbucks", "address": "King St N Waterloo ON Canada"},
        {"name": "McDonald's", "address": "King St S Waterloo ON Canada"},
        {"name": "Shoppers Drug Mart", "address": "King St S Waterloo ON Canada"},
        {"name": "LCBO", "address": "King St N Waterloo ON Canada"},
    ],
    "Near Wilfrid Laurier University": [
        {"name": "Williams Fresh Cafe", "address": "King St N Waterloo ON Canada"},
        {"name": "Wilfrid Laurier University", "address": "University Ave W Waterloo ON Canada"},
        {"name": "Tim Hortons", "address": "King St N Waterloo ON Canada"},
    ],
    "University Corridor": [
        {"name": "University of Waterloo", "address": "University Ave W Waterloo ON Canada"},
        {"name": "Tim Hortons", "address": "University Ave W Waterloo ON Canada"},
        {"name": "Plaza", "address": "University Ave W Waterloo ON Canada"},
    ],
    "Bridgeport": [
        {"name": "Tim Hortons", "address": "Bridgeport Rd Waterloo ON Canada"},
        {"name": "Food Basics", "address": "Bridgeport Rd Waterloo ON Canada"},
    ],
    "North King": [
        {"name": "Conestoga Mall", "address": "King St N Waterloo ON Canada"},
        {"name": "Walmart", "address": "King St N Waterloo ON Canada"},
    ],
    "Uptown Fringe": [
        {"name": "Starbucks", "address": "King St N Waterloo ON Canada"},
        {"name": "Vincenzo's", "address": "Erb St W Waterloo ON Canada"},
    ],
}

# Cache: once we get a successful BestTime result for a neighbourhood,
# reuse it for all other listings in the same neighbourhood.
# This saves API credits and avoids hammering BestTime.
_neighbourhood_cache: dict[str, list] = {}


def _parse_besttime_hourly(data: dict) -> list | None:
    """Extract averaged 24h hourly array from a BestTime forecast response."""
    analysis = data.get("analysis", [])
    all_days = [day.get("day_raw", []) for day in analysis if day.get("day_raw")]
    if not all_days:
        return None
    num_days = len(all_days)
    return [
        round(sum(all_days[d][h] for d in range(num_days)) / num_days)
        for h in range(24)
    ]


async def _besttime_request(client: httpx.AsyncClient, venue_name: str, venue_address: str) -> list | None:
    """Make a single BestTime forecast request. Returns 24h array or None."""
    try:
        response = await client.post(
            BESTTIME_FORECAST_URL,
            params={
                "api_key_private": BESTTIME_PRIVATE_KEY,
                "venue_name": venue_name,
                "venue_address": venue_address,
            },
            timeout=20.0,
        )
        data = response.json()
        if data.get("status") == "OK":
            return _parse_besttime_hourly(data)
        return None
    except Exception:
        return None


async def fetch_besttime_hourly(client: httpx.AsyncClient, listing: dict) -> list:
    """Fetch real hourly busyness from BestTime for a listing.

    Strategy:
    1. Check cache — if we already got data for this neighbourhood, reuse it
    2. Try the exact listing address
    3. Try popular proxy venues nearby (cafés, malls, etc.)
    4. Fall back to hardcoded neighbourhood patterns
    """
    neighbourhood = listing["neighbourhood"]

    if not BESTTIME_PRIVATE_KEY:
        return NEIGHBOURHOOD_FALLBACK.get(neighbourhood, DEFAULT_FALLBACK)

    # 1. Check cache first
    if neighbourhood in _neighbourhood_cache:
        return _neighbourhood_cache[neighbourhood]

    # 2. Try the exact listing address
    print(f"  🔍 BestTime: trying exact address for {listing['address']}...")
    result = await _besttime_request(
        client,
        listing["besttime_query"]["name"],
        listing["besttime_query"]["address"],
    )
    if result:
        print(f"  ✅ BestTime: got data for {listing['address']}")
        _neighbourhood_cache[neighbourhood] = result
        return result

    # 3. Try proxy venues for this neighbourhood
    proxies = NEIGHBOURHOOD_PROXIES.get(neighbourhood, [])
    for proxy in proxies:
        print(f"  🔍 BestTime: trying proxy '{proxy['name']}' near {neighbourhood}...")
        result = await _besttime_request(client, proxy["name"], proxy["address"])
        if result:
            print(f"  ✅ BestTime: got proxy data from '{proxy['name']}' for {neighbourhood}")
            _neighbourhood_cache[neighbourhood] = result
            return result

    # 4. Fall back to hardcoded patterns
    print(f"  ⚠️  BestTime: no data available for {neighbourhood}, using fallback")
    fallback = NEIGHBOURHOOD_FALLBACK.get(neighbourhood, DEFAULT_FALLBACK)
    _neighbourhood_cache[neighbourhood] = fallback
    return fallback


def score_listing(listing: dict, budget: float = None, square_footage: float = None) -> Optional[int]:
    """Rule-based scoring 0-100. AI scoring slots in here later."""
    score = 50

    # Hard filter: over budget
    if budget and listing["monthly_cost"] > budget:
        return None

    # Budget fit bonus
    if budget:
        ratio = listing["monthly_cost"] / budget
        if ratio < 0.6:   score += 5
        elif ratio < 0.8: score += 15
        else:             score += 10

    # Square footage fit
    if square_footage:
        diff = abs(listing["square_footage"] - square_footage) / square_footage
        if diff < 0.1:    score += 20
        elif diff < 0.25: score += 12
        elif diff < 0.5:  score += 5
        else:             score -= 5

    # Neighbourhood bonus
    n_scores = {
        "Uptown Waterloo": 20,
        "Near Wilfrid Laurier University": 18,
        "University Corridor": 15,
        "North King": 10,
        "Bridgeport": 8,
        "Uptown Fringe": 6,
    }
    score += n_scores.get(listing["neighbourhood"], 5)

    return min(100, max(0, score))


class SearchRequest(BaseModel):
    business_type: Optional[str] = None
    location: Optional[str] = None
    budget: Optional[float] = None
    square_footage: Optional[float] = None


@router.post("/search")
async def search_locations(body: SearchRequest):
    # Score and filter
    scored = []
    for listing in LISTINGS:
        score = score_listing(listing, body.budget, body.square_footage)
        if score is not None:
            scored.append((listing, score))

    # Sort by score descending
    scored.sort(key=lambda x: x[1], reverse=True)

    # All 20 when no filters, top 10 when user has filtered by budget/sqft
    has_filters = bool(body.budget or body.square_footage)
    top = scored[:10] if has_filters else scored

    # If nothing passed the budget filter, return top 5 anyway so map isn't empty
    if not top:
        top = sorted(
            [(l, score_listing(l) or 0) for l in LISTINGS],
            key=lambda x: x[1], reverse=True
        )[:5]

    # Get foot traffic from cache (pre-fetched at startup) — instant, no API calls
    results = []
    for listing, score in top:
        neighbourhood = listing["neighbourhood"]
        hourly = _neighbourhood_cache.get(
            neighbourhood,
            NEIGHBOURHOOD_FALLBACK.get(neighbourhood, DEFAULT_FALLBACK),
        )
        results.append({
            "id": listing["id"],
            "name": listing["neighbourhood"],
            "address": listing["address"],
            "latitude": listing["latitude"],
            "longitude": listing["longitude"],
            "opportunity_score": score,
            "estimated_rent": listing["monthly_cost"],
            "square_footage": listing["square_footage"],
            "projected_profit_margin": round((1 - listing["monthly_cost"] / 8000) * 0.35, 2),
            "hourly": hourly,
        })

    return {"status": "ok", "locations": results}


# ── New endpoint: get all listings with current (geocoded) coords ─────────────
# Frontend can call this on load to sync DEFAULT_RECOMMENDATIONS with real coords
@router.get("/all")
async def get_all_listings():
    """Return all 20 listings with their geocoded coordinates.
    Frontend can call this to replace hardcoded DEFAULT_RECOMMENDATIONS."""
    results = []
    for listing in LISTINGS:
        results.append({
            "id": listing["id"],
            "name": listing["neighbourhood"],
            "address": listing["address"],
            "latitude": listing["latitude"],
            "longitude": listing["longitude"],
            "opportunity_score": score_listing(listing) or 50,
            "estimated_rent": listing["monthly_cost"],
            "square_footage": listing["square_footage"],
            "projected_profit_margin": round((1 - listing["monthly_cost"] / 8000) * 0.35, 2),
            "hourly": _neighbourhood_cache.get(
                listing["neighbourhood"],
                NEIGHBOURHOOD_FALLBACK.get(listing["neighbourhood"], DEFAULT_FALLBACK),
            ),
        })
    return {"status": "ok", "locations": results}


@router.get("/health")
async def health():
    return {
        "status": "ok",
        "besttime_configured": bool(BESTTIME_PRIVATE_KEY),
        "mapbox_configured": bool(MAPBOX_TOKEN),
        "total_listings": len(LISTINGS),
    }