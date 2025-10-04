from app.main import run_phase3

def cli_entry():
    user_data = {
        "id": "user123",
        "name": "Justin",
        "health": {"asthma": False, "allergies": True},
        "preferences": {"temp_min": 18, "temp_max": 33}
    }
    run_phase3(user_data, 28.6139, 77.2090)

if __name__ == "__main__":
    cli_entry()
