from flask import Flask, render_template, request, redirect, url_for, jsonify
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

@app.route('/api/location/track', methods=['POST'])
def track_location():
    """Track user location continuously and predict destination."""
    from app.backend.location_tracker import LocationTracker
    from app.backend.pattern_recognizer import PatternRecognizer
    from app.backend.notification_manager import NotificationManager
    
    data = request.get_json()
    lat = data.get('latitude')
    lon = data.get('longitude')
    accuracy = data.get('accuracy')
    
    if not lat or not lon:
        return jsonify({"status": "error", "message": "Invalid data"}), 400
    
    # Save location to database
    tracker = LocationTracker()
    tracker.add_location(float(lat), float(lon), accuracy)
    
    # Check if we have enough data for pattern recognition
    location_count = tracker.get_location_count()
    
    predicted_destination = None
    
    if location_count >= 20:  # Need at least 20 points for ML
        # Run pattern recognition
        recognizer = PatternRecognizer()
        recognizer.cluster_locations()
        
        # Predict destination
        predicted_destination = recognizer.predict_destination(float(lat), float(lon))
        
        # If destination predicted, send proactive weather alert
        if predicted_destination:
            dest_lat = predicted_destination['latitude']
            dest_lon = predicted_destination['longitude']
            dest_name = predicted_destination['name']
            
            # Fetch weather for destination
            dest_weather = fetch_weather(dest_lat, dest_lon)
            
            # Check if weather is notably different
            current_weather = fetch_weather(float(lat), float(lon))
            temp_diff = abs(dest_weather['temperature'] - current_weather['temperature'])
            precip_diff = dest_weather['precipitation'] - current_weather['precipitation']
            
            # Send notification if significant weather change
            if temp_diff > 5 or precip_diff > 1:
                notif_manager = NotificationManager()
                message = f"Heading to {dest_name}?\nWeather: {dest_weather['temperature']}°C"
                if dest_weather['precipitation'] > 0:
                    message += f", {dest_weather['precipitation']}mm rain - bring umbrella!"
                
                notif_manager.send_notification(
                    title=f"🎯 Weather Alert for {dest_name}",
                    message=message
                )
    
    return jsonify({
        "status": "success",
        "location_count": location_count,
        "predicted_destination": predicted_destination
    })

@app.route('/api/patterns/analyze', methods=['POST'])
def analyze_patterns():
    """Manually trigger pattern recognition."""
    from app.backend.pattern_recognizer import PatternRecognizer
    
    recognizer = PatternRecognizer()
    patterns = recognizer.cluster_locations()
    
    return jsonify({
        "status": "success",
        "patterns": patterns
    })
@app.route('/predict', methods=['GET', 'POST'])
def predict():
    """Long-term weather prediction page using NASA model."""
    if request.method == 'POST':
        try:
            from app.ai.nasa_predictor import get_predictor
            from datetime import datetime
            
            # Get user inputs
            latitude = float(request.form.get('latitude'))
            longitude = float(request.form.get('longitude'))
            date_str = request.form.get('target_date')
            target_date = datetime.strptime(date_str, '%Y-%m-%d')
            
            # Run prediction
            predictor = get_predictor()
            prediction = predictor.predict(latitude, longitude, target_date)
            
            return render_template('prediction_result.html', 
                                 prediction=prediction,
                                 latitude=latitude,
                                 longitude=longitude)
        
        except Exception as e:
            return render_template('predict.html', error=str(e))
    
    return render_template('predict.html')
if __name__ == '__main__':
    app.run(debug=True, port=5000)
