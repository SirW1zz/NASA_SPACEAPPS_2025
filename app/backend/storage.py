import json
import os

users_file = os.path.join(os.path.dirname(__file__), "../../data/users.json")
users = {}

def load_users():
    global users
    if os.path.exists(users_file):
        with open(users_file, "r") as f:
            users = json.load(f)
    else:
        users = {}

def save_users():
    with open(users_file, "w") as f:
        json.dump(users, f, indent=4)

def log_activity(username, activity, time):
    from datetime import date
    today = str(date.today())
    if "logs" not in users[username]:
        users[username]["logs"] = []
    users[username]["logs"].append({
        "date": today,
        "activity": activity,
        "time": time,
        "advice_given": False
    })
    save_users()
