from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_cors import CORS
from app.backend.weather import fetch_weather
from app.integrations.google_calendar import fetch_events
from app.integrations.google_tasks import fetch_tasks
from app.backend.health_profile import load_health_profile, save_health_profile
from app.backend.location_manager import save_user_location, load_user_location
from app.backend.event_weather_processor import process_events_with_weather
from app.ai.gemini_brain import get_weather_advice # <-- Using the real function
from datetime import datetime
from app.backend.scheduler import WeatherScheduler
import os

app = Flask(__name__)

# --- UPDATED CORS CONFIGURATION (No Change) ---
CORS(app, 
     resources={r"/*": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000", "*"]}}, 
     supports_credentials=True, 
     allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
)

# Initialize and start background scheduler
weather_scheduler = WeatherScheduler()
weather_scheduler.start()

# --- NEW ENDPOINTS TO FIX FRONTEND 404 & CORS ERRORS ---

@app.route('/health', methods=['GET'])
def health_check():
    """API endpoint used by the frontend to confirm the backend server is running (Fixes 404)."""
    return jsonify({"status": "healthy", "message": "Backend is up and running."}), 200

# --- ACTIVE GEMINI INTEGRATION ---
@app.route('/gemini/generate', methods=['POST'])
def api_gemini_generate():
    """API endpoint for generating AI weather insights."""
    try:
        # 1. Gather all necessary data
        user_data = load_health_profile()
        location = load_user_location()

        if not user_data or not location:
            # Profile or location data missing (e.g., first run)
            return jsonify({"error": "Profile or Location not set, cannot generate insight."}), 400
        
        lat, lon = location
        
        # 2. Get data from helper functions (needs real implementation later)
        home_weather = fetch_weather(lat, lon) 
        # NOTE: process_events_with_weather should wrap the fetch_events call
        event_weather_data = process_events_with_weather(fetch_events(days_ahead=3)) 
        tasks_list = fetch_tasks(days_ahead=2)

        # 3. Call the actual AI function with structured data
        insight = get_weather_advice(
            user_data=user_data,
            home_weather=home_weather,
            event_weather_data=event_weather_data,
            tasks_list=tasks_list
        )
        
        # 4. Return the AI-generated text
        return jsonify({"insight": insight}), 200

    except Exception as e:
        # If the function fails (e.g., Gemini API key issue, network issue, or missing dependencies)
        print(f"Error in /gemini/generate: {e}")
        return jsonify({"error": "Failed to generate AI insight.", "details": str(e)}), 500


# --- FIX: Missing Calendar Endpoint ---
@app.route('/calendar/today', methods=['GET'])
def api_calendar_today():
    """API endpoint for today's calendar events (Fixes CORS/404)."""
    # NOTE: You will need to implement real fetching logic here later.
    mock_events = [
        {"id": 1, "title": "Gym Session", "time": "07:00", "weather_impact": "Good"},
        {"id": 2, "title": "Team Meeting", "time": "15:00", "weather_impact": "Neutral"}
    ]
    return jsonify(mock_events), 200

# --- FIX: Missing Tasks Endpoint ---
@app.route('/tasks', methods=['GET'])
def api_tasks():
    """API endpoint for tasks list (Fixes CORS/404)."""
    # NOTE: You will need to implement real fetching logic here later.
    mock_tasks = [
        {"id": 101, "title": "Buy groceries", "due_date": "Today"},
        {"id": 102, "title": "Review PR", "due_date": "Tomorrow"}
    ]
    return jsonify(mock_tasks), 200

# --- EXISTING ROUTES BELOW ---

@app.route('/')
def index():
    """Main dashboard - shows current weather and upcoming events."""
    # Check if health profile exists
    profile = load_health_profile()
    if not profile:
        return redirect(url_for('onboarding'))
    
    # Check if location is set
    location = load_user_location()
    if not location:
        return render_template('location_setup.html')
    
    lat, lon = location
    
    # Fetch current weather
    current_weather = fetch_weather(lat, lon)
    
    # Fetch events and tasks
    events = fetch_events(days_ahead=3)
    tasks = fetch_tasks(days_ahead=2)
    
    return render_template('dashboard.html', 
                             profile=profile,
                             weather=current_weather,
                             events=events,
                             tasks=tasks,
                             location=location)

@app.route('/api/location/save', methods=['POST'])
def save_location():
    """API endpoint to save user's location from browser."""
    data = request.get_json()
    lat = data.get('latitude')
    lon = data.get('longitude')
    
    if lat and lon:
        save_user_location(float(lat), float(lon))
        return jsonify({"status": "success", "message": "Location saved"})
    return jsonify({"status": "error", "message": "Invalid location data"}), 400

@app.route('/api/weather/current')
def api_current_weather():
    """API endpoint for live weather updates."""
    location = load_user_location()
    if not location:
        return jsonify({"error": "Location not set"}), 400
    
    lat, lon = location
    weather = fetch_weather(lat, lon)
    return jsonify(weather)

@app.route('/onboarding', methods=['GET', 'POST'])
def onboarding():
    """Health profile onboarding page."""
    if request.method == 'POST':
        profile_data = {
            "name": request.form.get('name'),
            "health": {
                "asthma": request.form.get('asthma') == 'on',
                "allergies": request.form.get('allergies') == 'on',
                "low_bp": request.form.get('low_bp') == 'on',
                "high_bp": request.form.get('high_bp') == 'on',
                "diabetes": request.form.get('diabetes') == 'on',
                "heart_condition": request.form.get('heart_condition') == 'on'
            },
            "preferences": {
                "temp_min": int(request.form.get('temp_min', 18)),
                "temp_max": int(request.form.get('temp_max', 32)),
                "activity_level": int(request.form.get('activity_level', 2))
            },
            "created_at": str(datetime.now())
        }
        save_health_profile(profile_data)
        return redirect(url_for('index'))
    
    return render_template('onboarding.html')

@app.route('/settings', methods=['GET', 'POST'])
def settings():
    """Settings page for notification timing, etc."""
    if request.method == 'POST':
        # Update notification settings
        from app.backend.notification_manager import NotificationManager
        notif_manager = NotificationManager()
        
        new_settings = {
            "event_reminder_minutes": int(request.form.get('reminder_minutes', 15)),
            "morning_summary_time": request.form.get('morning_time', '07:00'),
            "notifications_enabled": request.form.get('notifications_enabled') == 'on',
            "sound_enabled": request.form.get('sound_enabled') == 'on'
        }
        
        notif_manager.save_settings(new_settings)
        
        # Restart scheduler with new settings
        weather_scheduler.stop()
        weather_scheduler.start()
        
        return redirect(url_for('settings'))
    
    profile = load_health_profile()
    location = load_user_location()
    
    from app.backend.notification_manager import NotificationManager
    notif_manager = NotificationManager()
    settings_data = notif_manager.settings
    
    return render_template('settings.html', profile=profile, location=location, settings=settings_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080, debug=True)
