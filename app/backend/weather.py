import meteomatics.api as api
from datetime import datetime, timedelta

METEOMATICS_USER = "jose_freddie"
METEOMATICS_PASS = "z4btVV8cJhP6Ny0Oj5kH"

def fetch_weather(lat, lon):
    now = datetime.utcnow()
    params = ["t_2m:C", "precip_1h:mm", "wind_speed_10m:ms", "relative_humidity_2m:p"]
    df = api.query_time_series([(lat, lon)], now, now + timedelta(hours=1), timedelta(hours=1), params, METEOMATICS_USER, METEOMATICS_PASS)
    return {
        "temperature": float(df["t_2m:C"].values[0]),
        "precipitation": float(df["precip_1h:mm"].values[0]),
        "wind": float(df["wind_speed_10m:ms"].values[0]),
        "humidity": float(df["relative_humidity_2m:p"].values[0])
    }
