from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from datetime import datetime, timedelta
from typing import List, Dict
import os.path
import pickle

SCOPES = [
    'https://www.googleapis.com/auth/calendar.readonly',
    'https://www.googleapis.com/auth/tasks.readonly'
]

def get_credentials():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file('credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    return creds

def parse_event_datetime(event: Dict) -> datetime:
    """
    Extract datetime from event (handles both datetime and date formats).
    """
    start = event['start']
    if 'dateTime' in start:
        # Parse ISO format datetime
        return datetime.fromisoformat(start['dateTime'].replace('Z', '+00:00'))
    elif 'date' in start:
        # All-day event - use 9 AM as default time
        date_str = start['date']
        return datetime.strptime(date_str, '%Y-%m-%d').replace(hour=9)
    return datetime.utcnow()

def fetch_events(days_ahead: int = 7) -> List[Dict]:
    """
    Fetch upcoming calendar events with location and time information.
    """
    creds = get_credentials()
    service = build('calendar', 'v3', credentials=creds)
    
    now = datetime.utcnow()
    time_max = now + timedelta(days=days_ahead)
    
    events_result = service.events().list(
        calendarId='primary',
        timeMin=now.isoformat() + 'Z',
        timeMax=time_max.isoformat() + 'Z',
        maxResults=50,
        singleEvents=True,
        orderBy='startTime'
    ).execute()
    
    events = events_result.get('items', [])
    
    parsed_events = []
    for event in events:
        parsed_event = {
            'summary': event.get('summary', 'Untitled Event'),
            'location': event.get('location', None),  # Address string or None
            'datetime': parse_event_datetime(event),
            'description': event.get('description', '')
        }
        parsed_events.append(parsed_event)
    
    return parsed_events
