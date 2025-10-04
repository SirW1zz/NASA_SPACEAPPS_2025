from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import os.path
import pickle

SCOPES = ['https://www.googleapis.com/auth/tasks.readonly']

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
            creds = flow.run_local_server(port=0, redirect_uri_trailing_slash=False)

        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    return creds

def fetch_tasks():
    creds = get_credentials()
    service = build('tasks', 'v1', credentials=creds)
    results = service.tasklists().list().execute()
    return results.get('items', [])
