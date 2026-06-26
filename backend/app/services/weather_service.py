import httpx
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

REGION_COORDS: Dict[str, tuple] = {
    # Countries
    "India": (20.5937, 78.9629),
    "United States": (37.0902, -95.7129),
    "USA": (37.0902, -95.7129),
    "China": (35.8617, 104.1954),
    "Brazil": (-14.2350, -51.9253),
    "Germany": (51.1657, 10.4515),
    "Japan": (36.2048, 138.2529),
    "Australia": (-25.2744, 133.7751),
    "Bangladesh": (23.6850, 90.3563),
    "Egypt": (26.8206, 30.8025),
    "France": (46.2276, 2.2137),
    "Russia": (61.5240, 105.3188),
    "Nigeria": (9.0820, 8.6753),
    "Canada": (56.1304, -106.3468),
    "Argentina": (-38.4161, -63.6167),
    "Indonesia": (-0.7893, 113.9213),
    "Pakistan": (30.3753, 69.3451),
    "Kenya": (-0.0236, 37.9062),
    "South Africa": (-30.5595, 22.9375),
    "Mexico": (23.6345, -102.5528),
    # States / Regions
    "Maharashtra": (19.7515, 75.7139),
    "Rajasthan": (27.0238, 74.2179),
    "Assam": (26.2006, 92.9376),
    "Punjab": (31.1471, 75.3412),
    "California": (36.7783, -119.4179),
    "Texas": (31.9686, -99.9018),
    "Florida": (27.9944, -81.7603),
    "Queensland": (-20.9176, 142.7028),
    "Bavaria": (48.7904, 11.4979),
    "Sichuan": (30.6171, 102.7103),
    # Cities
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.6139, 77.2090),
    "Guwahati": (26.1445, 91.7362),
    "Jaipur": (26.9124, 75.7873),
    "Jodhpur": (26.2389, 73.0243),
    "Pune": (18.5204, 73.8567),
    "Nagpur": (21.1458, 79.0882),
    "Houston": (29.7604, -95.3698),
    "Los Angeles": (34.0522, -118.2437),
    "San Francisco": (37.7749, -122.4194),
    "San Diego": (32.7157, -117.1611),
    "Miami": (25.7617, -80.1918),
    "São Paulo City": (-23.5505, -46.6333),
    "Manaus": (-3.1190, -60.0217),
    "Tokyo City": (35.6762, 139.6503),
    "Osaka City": (34.6937, 135.5023),
    "Beijing": (39.9042, 116.4074),
    "Wuhan": (30.5928, 114.3055),
    "Cairo": (30.0444, 31.2357),
    "Dhaka City": (23.8103, 90.4125),
    "Paris": (48.8566, 2.3522),
    "Marseille": (43.2965, 5.3698),
    "Berlin City": (52.5200, 13.4050),
    "Sydney": (-33.8688, 151.2093),
    "Brisbane": (-27.4698, 153.0251),
    "Jakarta": (-6.2088, 106.8456),
    "Lagos City": (6.5244, 3.3792),
    "Nairobi": (-1.2921, 36.8219),
    "Toronto": (43.6532, -79.3832),
    "Vancouver": (49.2827, -123.1207),
    "Moscow": (55.7558, 37.6173),
    "Novosibirsk": (54.9885, 82.9207),
    "Dhaka": (23.8103, 90.4125),
    "Global": (20.0, 0.0),
}

OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"


async def get_weather_for_region(region: str) -> Optional[Dict]:
    """Fetch real-time weather from Open-Meteo (free, no API key needed)."""
    coords = REGION_COORDS.get(region)
    if not coords:
        for key in REGION_COORDS:
            if key.lower() in region.lower() or region.lower() in key.lower():
                coords = REGION_COORDS[key]
                break
    if not coords:
        coords = (20.0, 0.0)

    lat, lon = coords
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": "temperature_2m,precipitation,wind_speed_10m,relative_humidity_2m,weather_code",
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
        "forecast_days": 7,
        "timezone": "auto",
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(OPEN_METEO_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        current = data.get("current", {})
        daily = data.get("daily", {})
        precip_list = daily.get("precipitation_sum") or []

        return {
            "source": "Open-Meteo API (real-time)",
            "location": region,
            "coordinates": {"lat": round(lat, 4), "lon": round(lon, 4)},
            "current": {
                "temperature_c": current.get("temperature_2m"),
                "precipitation_mm": current.get("precipitation"),
                "wind_speed_kmh": current.get("wind_speed_10m"),
                "humidity_pct": current.get("relative_humidity_2m"),
                "weather_code": current.get("weather_code"),
            },
            "forecast_7day": {
                "dates": daily.get("time", []),
                "temp_max_c": daily.get("temperature_2m_max", []),
                "temp_min_c": daily.get("temperature_2m_min", []),
                "precipitation_mm": precip_list,
                "total_precipitation_mm": round(sum(x for x in precip_list if x is not None), 1),
            },
        }
    except Exception as e:
        logger.warning(f"Open-Meteo fetch failed for '{region}': {e}")
        return None
