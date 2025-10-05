from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime, timedelta, timezone
from typing import List, Dict
import atexit

from app.integrations.google_calendar import fetch_events
from app.integrations.google_tasks import fetch_tasks
from app.backend.weather import fetch_weather
from app.backend.location_manager import load_user_location
from app.backend.health_profile import load_health_profile
from app.backend.notification_manager import NotificationManager
from app.backend.event_weather_processor import process_events_with_weather
from app.ai.gemini_brain import get_weather_advice

class WeatherScheduler:
    """Background scheduler for weather notifications."""
    
    def __init__(self):
        self.scheduler = BackgroundScheduler()
        self.notification_manager = NotificationManager()
        self.last_notified_events = set()
        
        atexit.register(lambda: self.scheduler.shutdown())
    
    def start(self):
        """Start the background scheduler."""
        self.scheduler.add_job(
            func=self.check_upcoming_events,
            trigger='interval',
            minutes=5,
            id='event_checker',
            replace_existing=True
        )
        
        settings = self.notification_manager.settings
        morning_time = settings.get('morning_summary_time', '07:00')
        hour, minute = map(int, morning_time.split(':'))
        
        self.scheduler.add_job(
            func=self.send_morning_summary,
            trigger=CronTrigger(hour=hour, minute=minute),
            id='morning_summary',
            replace_existing=True
        )
        
        self.scheduler.start()
        print("✅ Background scheduler started!")
        print(f"   - Event reminders: Every 5 minutes")
        print(f"   - Morning summary: {morning_time} daily")
    
    def check_upcoming_events(self):
        """Check for events/tasks that need reminders."""
        print(f"\n🔍 Checking for upcoming events... ({datetime.now().strftime('%I:%M %p')})")
        
        try:
            location = load_user_location()
            profile = load_health_profile()
            
            if not location or not profile:
                print("⚠️ User profile or location not set")
                return
            
            lat, lon = location
            reminder_minutes = self.notification_manager.settings.get('event_reminder_minutes', 15)
            
            events = fetch_events(days_ahead=3)
            tasks = fetch_tasks(days_ahead=2)
            
            now = datetime.now(timezone.utc)
            reminder_threshold = now + timedelta(minutes=reminder_minutes)
            
            for event in events:
                event_time = event.get('datetime')
                if not event_time:
                    continue
                
                if event_time.tzinfo is None:
                    event_time = event_time.replace(tzinfo=timezone.utc)
                
                if now <= event_time <= reminder_threshold:
                    event_id = f"event_{event.get('summary')}_{event_time.isoformat()}"
                    
                    if event_id in self.last_notified_events:
                        continue
                    
                    event_lat, event_lon = lat, lon
                    weather = fetch_weather(event_lat, event_lon)
                    
                    self.notification_manager.send_event_reminder(event, weather, source="calendar")
                    self.last_notified_events.add(event_id)
                    print(f"   ✅ Sent reminder: {event.get('summary')}")
            
            for task in tasks:
                task_due = task.get('due')
                if not task_due:
                    continue
                
                if task_due.tzinfo is None:
                    task_due = task_due.replace(tzinfo=timezone.utc)
                
                if now <= task_due <= reminder_threshold:
                    task_id = f"task_{task.get('title')}_{task_due.isoformat()}"
                    
                    if task_id in self.last_notified_events:
                        continue
                    
                    weather = fetch_weather(lat, lon)
                    self.notification_manager.send_event_reminder(task, weather, source="tasks")
                    self.last_notified_events.add(task_id)
                    print(f"   ✅ Sent reminder: {task.get('title')}")
            
            cutoff_time = now - timedelta(hours=24)
            self.last_notified_events = {
                event_id for event_id in self.last_notified_events
                if not any(str(cutoff_time.date()) in event_id)
            }
        
        except Exception as e:
            print(f"❌ Error checking events: {e}")
    
    def send_morning_summary(self):
        """Generate and send morning weather summary."""
        print(f"\n🌅 Sending morning summary... ({datetime.now().strftime('%I:%M %p')})")
        
        try:
            location = load_user_location()
            profile = load_health_profile()
            
            if not location or not profile:
                return
            
            lat, lon = location
            
            events = fetch_events(days_ahead=1)
            tasks = fetch_tasks(days_ahead=1)
            home_weather = fetch_weather(lat, lon)
            
            event_weather_data = process_events_with_weather(
                events=events,
                home_location=(lat, lon)
            )
            
            advice = get_weather_advice(
                user_data=profile,
                home_weather=home_weather,
                event_weather_data=event_weather_data,
                tasks_list=tasks
            )
            
            temp = home_weather.get('temperature', 'N/A')
            precip = home_weather.get('precipitation', 0)
            event_count = len(events)
            task_count = len(tasks)
            
            summary = f"Today: {temp}°C"
            if precip > 0:
                summary += f", {precip}mm rain expected"
            summary += f"\n{event_count} events, {task_count} tasks"
            
            self.notification_manager.send_morning_summary(summary)
            print(f"   ✅ Morning summary sent")
        
        except Exception as e:
            print(f"❌ Error sending morning summary: {e}")
    
    def stop(self):
        """Stop the scheduler."""
        self.scheduler.shutdown()
        print("🛑 Scheduler stopped")
