from winotify import Notification, audio
from typing import Dict, List
from datetime import datetime
import json
import os

NOTIFICATION_SETTINGS_FILE = "notification_settings.json"

class NotificationManager:
    """Manages desktop notifications with customizable settings."""
    
    def __init__(self):
        self.settings = self.load_settings()
    
    def load_settings(self) -> Dict:
        """Load notification settings (timing preferences, etc.)."""
        if os.path.exists(NOTIFICATION_SETTINGS_FILE):
            with open(NOTIFICATION_SETTINGS_FILE, 'r') as f:
                return json.load(f)
        
        # Default settings
        return {
            "event_reminder_minutes": 15,
            "morning_summary_time": "07:00",
            "notifications_enabled": True,
            "sound_enabled": True
        }
    
    def save_settings(self, settings: Dict) -> None:
        """Save notification settings."""
        with open(NOTIFICATION_SETTINGS_FILE, 'w') as f:
            json.dump(settings, f, indent=2)
        self.settings = settings
    
    def send_notification(self, title: str, message: str) -> None:
        """Send a desktop notification using winotify."""
        if not self.settings.get("notifications_enabled", True):
            return
        
        try:
            toast = Notification(
                app_id="Rain-E Weather Assistant",
                title=title,
                msg=message,
                duration="short"
            )
            
            # Add sound if enabled
            if self.settings.get("sound_enabled", True):
                toast.set_audio(audio.Default, loop=False)
            
            toast.show()
            print(f"📢 Notification sent: {title}")
        except Exception as e:
            print(f"❌ Failed to send notification: {e}")
    
    def send_event_reminder(self, event: Dict, weather: Dict, source: str = "calendar") -> None:
        """Send reminder notification for upcoming event."""
        event_name = event.get('summary') or event.get('title', 'Event')
        event_time = event.get('datetime') or event.get('due')
        
        # Format time
        if event_time:
            time_str = event_time.strftime('%I:%M %p')
        else:
            time_str = "soon"
        
        # Build weather message
        temp = weather.get('temperature', 'N/A')
        precip = weather.get('precipitation', 0)
        
        weather_msg = f"{temp}°C"
        if precip > 0:
            weather_msg += f", {precip}mm rain - bring umbrella!"
        
        # Source attribution
        source_emoji = "📅" if source == "calendar" else "✅"
        
        title = f"{source_emoji} {event_name}"
        message = f"Starting at {time_str}\nWeather: {weather_msg}"
        
        self.send_notification(title, message)
    
    def send_morning_summary(self, summary_text: str) -> None:
        """Send morning daily summary."""
        self.send_notification(
            title="🌤️ Good Morning - Today's Weather",
            message=summary_text
        )
    
    def send_weather_alert(self, alert_type: str, message: str) -> None:
        """Send weather-related alerts."""
        alert_icons = {
            "rain": "☔",
            "heat": "🔥",
            "cold": "❄️",
            "wind": "💨",
            "storm": "⛈️"
        }
        
        icon = alert_icons.get(alert_type, "⚠️")
        self.send_notification(
            title=f"{icon} Weather Alert",
            message=message
        )
