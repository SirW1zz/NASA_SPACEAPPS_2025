from googleapiclient.discovery import build
from datetime import datetime, timedelta, timezone
from typing import List, Dict
import os.path
import pickle

def get_credentials():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    return creds

def fetch_tasks(days_ahead: int = 2) -> List[Dict]:
    creds = get_credentials()
    service = build('tasks', 'v1', credentials=creds)
    
    now = datetime.now(timezone.utc)
    max_date = now + timedelta(days=days_ahead)
    
    task_lists = service.tasklists().list().execute().get('items', [])
    all_tasks = []
    
    for task_list in task_lists:
        tasks_result = service.tasks().list(tasklist=task_list['id'], showCompleted=False, showHidden=False).execute()
        tasks = tasks_result.get('items', [])
        
        for task in tasks:
            due_date_str = task.get('due')
            if due_date_str:
                due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
                if due_date <= max_date:
                    all_tasks.append({'title': task.get('title', 'Untitled Task'), 'due': due_date, 'notes': task.get('notes', ''), 'task_list': task_list['title']})
            else:
                all_tasks.append({'title': task.get('title', 'Untitled Task'), 'due': None, 'notes': task.get('notes', ''), 'task_list': task_list['title']})
    
    all_tasks.sort(key=lambda x: x['due'] if x['due'] else now)
    return all_tasks
