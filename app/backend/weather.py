def get_basic_forecast():
    # Hardcoded forecast for testing Phase 1
    return {"temperature": 25, "rain_start": "17:30", "rain_end": "18:30"}  # °C, rain window

def check_rain_during_activity(activity_time):
    """
    activity_time: string "HH:MM"
    Returns True if activity overlaps hardcoded rain
    """
    rain_start = int(get_basic_forecast()['rain_start'].replace(":", ""))
    rain_end = int(get_basic_forecast()['rain_end'].replace(":", ""))
    act_time = int(activity_time.replace(":", ""))
    return rain_start <= act_time <= rain_end
