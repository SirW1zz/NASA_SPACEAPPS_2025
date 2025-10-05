from flask import Flask, render_template, request, redirect, url_for, jsonify
from flask_cors import CORS
from app.backend.weather import fetch_weather
from app.integrations.google_calendar import fetch_events
from app.integrations.google_tasks import fetch_tasks
from app.backend.health_profile import load_health_profile, save_health_profile
from app.backend.location_manager import save_user_location, load_user_location
from app.backend.event_weather_processor import process_events_with_weather
from app.ai.gemini_brain import get_weather_advice
from datetime import datetime
from app.backend.scheduler import WeatherScheduler
import os

app = Flask(__name__)
CORS(app)

# Initialize and start background scheduler
weather_scheduler = WeatherScheduler()
weather_scheduler.start()

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
