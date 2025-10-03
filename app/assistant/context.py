from backend import weather, storage

def get_activity_risk(username):
    """
    Returns a list of activities that might be impacted by weather
    Format: [{"activity": str, "time": str, "risk": bool}]
    """
    storage.load_users()
    risky_activities = []

    user_data = storage.users.get(username)
    if not user_data or "logs" not in user_data:
        return risky_activities

    for log in user_data["logs"]:
        if not log.get("advice_given", False):
            risk = weather.check_rain_during_activity(log["time"])
            risky_activities.append({
                "activity": log["activity"],
                "time": log["time"],
                "risk": risk
            })
    return risky_activities
