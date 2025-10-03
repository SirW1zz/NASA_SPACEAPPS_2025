# NASA_SPACEAPPS_2025
The IT Mambas attempt NASA Space Apps 2025 challenge

"In your mind you are the best"
~ IT Mambas


README.md → Explains the project, how to run it, and what features are implemented.
requirements.txt → Lists Python packages needed to run the app (pip install -r requirements.txt).
.gitignore → Prevents committing unnecessary files (like __pycache__, virtual environments, or local data).


app/ → Main application code

main.py → Entry point for running the app (calls backend logic and frontend display).

backend/ → Core logic and data handling
user.py → Manages user accounts, logins, and profile info.
weather.py → Holds the basic forecast logic (temperature, rain probability, or simple rules).
storage.py → Reads/writes user data (JSON or SQLite), stores daily logs, rain verification, and preferences.

frontend/ → Minimal user interface
cli.py → Command-line interface to interact with users (input schedule, view forecast).
display.py → Handles formatting and showing data cleanly (weather info, journal logs, notifications).

utils/ → Helper functions
notifications.py → Local notifications (prints or desktop notifications) for weather alerts.

data/ → Stores user and app data
users.json → Example JSON file to hold user profiles, preferences, and daily logs for MVP.

tests/ → Unit testing
test_user.py → Tests functions in user.py.
test_weather.py → Tests forecast logic in weather.py.
test_storage.py → Tests reading/writing data in storage.py.

assistant/context.py: Stores session/user context helpers.
assistant/planner.py: Activity schedule/planning logic.

integrations/google_calendar.py: Google Calendar sync.
integrations/google_health.py: Google Health sync.
integrations/google_tasks.py: Google Tasks sync.

ui/desktop.py: Future desktop GUI interface.
ui/mobile.py: Future mobile GUI interface.
