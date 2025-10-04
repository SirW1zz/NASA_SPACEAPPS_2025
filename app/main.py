from app.ai.gemini_brain import get_weather_advice
from app.backend.user import UserProfile
from app.backend.weather import fetch_weather
from app.integrations.google_calendar import fetch_events
from app.integrations.google_tasks import fetch_tasks
from app.backend.event_weather_processor import process_events_with_weather
from app.utils.notifications import send_notification

def run_onboarding():
    """
    Runs an interactive onboarding process to collect user data.
    """
    print("="*60)
    print("👋 Welcome to Rain-E: Your Personal Weather God Assistant!")
    print("="*60)
    print("Let's get you set up with a few questions.\n")

    name = input("👤 What's your name? ")

    print(f"\nHi {name}! Now, let's pinpoint your home base.")
    while True:
        try:
            home_lat = float(input("🌍 Enter your home latitude: "))
            home_lon = float(input("🌍 Enter your home longitude: "))
            break
        except ValueError:
            print("❗️Oops! Please enter valid numbers for latitude and longitude.")

    print("\nGreat! Lastly, a bit about your style to personalize advice.")
    clothing_style = input("👕 What's your typical clothing style (e.g., casual, business, sporty)? ")
    
    user_data = {
        "name": name,
        "preferences": {
            "clothing_style": clothing_style
        }
    }
    
    print("\n✅ All set! We've got everything we need.")
    return user_data, home_lat, home_lon

def run_phase3(user_data: dict, home_lat: float, home_lon: float):
    """
    Main orchestration: Fetch calendar, tasks, weather for home + all events,
    send to Gemini for analysis, show notifications.
    """
    print("🌦️ Starting Weather God Assistant...\n")
    
    # Initialize user profile
    user = UserProfile(user_data)
    print(f"✓ User profile loaded: {user.name}")
    
    # Fetch home weather
    print(f"✓ Fetching weather for home location ({home_lat}, {home_lon})...")
    home_weather = fetch_weather(home_lat, home_lon)
    print(f"  Current temp: {home_weather['temperature']}°C")
    
    # Fetch calendar events
    print("✓ Fetching calendar events...")
    calendar_events = fetch_events(days_ahead=7)
    print(f"  Found {len(calendar_events)} upcoming events")
    
    # Fetch tasks
    print("✓ Fetching tasks...")
    tasks = fetch_tasks()
    print(f"  Found {len(tasks)} task lists")
    
    # Process events with location-specific weather
    print("✓ Processing event locations and weather forecasts...")
    event_weather_data = process_events_with_weather(calendar_events, (home_lat, home_lon))
    print(f"  Weather forecasts ready for {len(event_weather_data['weather_forecasts'])} events")
    
    # Send everything to Gemini for analysis
    print("✓ Analyzing with Gemini AI...")
    advice = get_weather_advice(user_data, home_weather, event_weather_data, tasks)
    
    # Display results
    print("\n" + "="*60)
    print("🧠 Rain-E ADVICE:")
    print("="*60)
    print(advice)
    print("="*60 + "\n")
    
    # Send notification
   # send_notification("Rain-E", "Your personalized weather advice is ready!")
    
    return advice

if __name__ == "__main__":
    # --- Onboarding Phase ---
    user_data, home_lat, home_lon = run_onboarding()
    
    # --- Main Application Logic ---
    run_phase3(user_data, home_lat, home_lon)
