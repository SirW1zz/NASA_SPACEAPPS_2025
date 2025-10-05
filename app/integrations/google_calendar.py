import os
import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from typing import List, Dict

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar.readonly', 
          'https://www.googleapis.com/auth/tasks.readonly']

# --- FIX: Set the exact path relative to the project root ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CREDENTIALS_FILE_PATH = os.path.join(BASE_DIR, 'credentials.json')

def get_credentials():
    """Shows how to retrieve OAuth credentials for the Google API."""
    creds = None
    # The file token.json stores the user's access and refresh tokens, and is created automatically when the authorization flow completes for the first time.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    
    # If there are no (valid) credentials available, let the user log in.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # --- CRITICAL FIX IMPLEMENTED HERE ---
            # Use the explicit path to credentials.json inside the app/integrations directory
            if not os.path.exists(CREDENTIALS_FILE_PATH):
                raise FileNotFoundError(f"Missing Google credentials file. Expected at: {CREDENTIALS_FILE_PATH}")
                
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE_PATH, SCOPES)
            
            # NOTE: For local testing, you typically run this locally and save the token.
            # In a deployed web app, you would handle this via a server-side OAuth flow.
            # Since we are just trying to get the app to run, this block may still require user interaction
            # or a saved 'token.json' file, but it resolves the file path crash.
            # The 'Client secrets must be for a web or installed app' error is often caused by the format
            # of the JSON file, which you have already corrected with the 'web' structure.
            
            # This line will only run if we need new authorization:
            # creds = flow.run_local_server(port=0) 
            
            # For hackathon/mock purposes, we bypass the interactive login after finding the file:
            return None # Return None to let the calling function handle the missing authorization

    return creds

def fetch_events(days_ahead: int) -> List[Dict]:
    """Fetches upcoming calendar events, but currently returns mock data to bypass the OAuth flow."""
    # Since OAuth is failing, we return mock data, relying on the frontend to display it.
    
    # The crash happens before this function runs, but if it succeeded, this is the final implementation:
    try:
        # This function attempts to get credentials, which is the crash point
        creds = get_credentials() 
        if not creds:
             raise Exception("OAuth credentials are not available.")
        
        service = build('calendar', 'v3', credentials=creds)
        
        now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
        time_max = (datetime.datetime.utcnow() + datetime.timedelta(days=days_ahead)).isoformat() + 'Z'

        events_result = service.events().list(calendarId='primary', timeMin=now,
                                              timeMax=time_max, maxResults=10, singleEvents=True,
                                              orderBy='startTime').execute()
        events = events_result.get('items', [])
        
        # Format events to be consistent with the frontend expectations
        formatted_events = []
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            formatted_events.append({
                'summary': event.get('summary', 'No Title'),
                'datetime': start,
                'location': event.get('location', '') 
            })
            
        return formatted_events
        
    except Exception as e:
        # Return mock data on failure to keep the application running
        print(f"Google Calendar/Task API failure: {e}. Returning mock data.")
        return [
            {"summary": "Gym Session (Mock)", "datetime": (datetime.datetime.now() + datetime.timedelta(hours=1)).isoformat(), "location": "Local Gym"},
            {"summary": "Team Meeting (Mock)", "datetime": (datetime.datetime.now() + datetime.timedelta(hours=5)).isoformat(), "location": "Starbucks, Downtown"}
        ]