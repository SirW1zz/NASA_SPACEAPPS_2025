from app.ai.gemini_brain import get_advice
from app.backend.user import UserProfile
from app.backend.weather import fetch_weather
from app.integrations.google_calendar import fetch_events
from app.integrations.google_tasks import fetch_tasks
from app.utils.notifications import send_notification

def run_phase3(user_data, lat, lon):
    user = UserProfile(user_data)
    weather = fetch_weather(lat, lon)
    calendar_events = fetch_events()
    tasks = fetch_tasks()
    
    advice = get_advice(user_data, weather, calendar_events, tasks)
    
    send_notification("Weather Parade Assistant", advice)
    print(advice)
