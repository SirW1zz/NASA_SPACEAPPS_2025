from assistant.context import get_activity_risk
from utils import notifications
from backend import storage

def generate_advice(username):
    """
    Returns advice messages for the user based on activity risk
    """
    advice_list = []
    risky_activities = get_activity_risk(username)

    for act in risky_activities:
        if act["risk"]:
            msg = f"⚠ Rain expected during your {act['activity']} at {act['time']}. Suggest carrying an umbrella or rescheduling."
        else:
            msg = f"✅ No rain expected during your {act['activity']} at {act['time']}. Safe to proceed!"
        advice_list.append(msg)

        # Mark advice as given
        storage.load_users()
        for log in storage.users[username]["logs"]:
            if log["activity"] == act["activity"] and log["time"] == act["time"]:
                log["advice_given"] = True
        storage.save_users()

        # Send notification via utils
        notifications.send_alert(msg)

    return advice_list
