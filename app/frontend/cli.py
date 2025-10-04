from app.main import run_phase3

def cli_entry():
    # Your user profile
    user_data = {
        "id": "user123",
        "name": "Justin",
        "health": {
            "asthma": False,
            "allergies": True,
            "bp": False,
            "diabetes": False
        },
        "preferences": {
            "temp_min": 18,
            "temp_max": 33
        }
    }
    
    # Your home coordinates (Delhi example - replace with your actual location)
    home_lat = 28.6139
    home_lon = 77.2090
    
    run_phase3(user_data, home_lat, home_lon)

if __name__ == "__main__":
    cli_entry()
