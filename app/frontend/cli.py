from backend import user, weather, storage

def run():
    storage.load_users()
    
    while True:
        print("\n1. Register user\n2. Log daily activity\n3. View forecast\n4. Exit")
        choice = input("Enter choice: ")
        
        if choice == "1":
            username = input("Enter username: ")
            user.register_user(username)
        
        elif choice == "2":
            username = input("Enter username: ")
            if username not in storage.users:
                print("User not found. Register first.")
                continue
            activity = input("Activity name: ")
            time = input("Activity time (HH:MM, 24h format): ")
            storage.log_activity(username, activity, time)
            
            # Check weather for advice
            if weather.check_rain_during_activity(time):
                print(f"⚠ Rain expected during your {activity} at {time}. Suggest carrying an umbrella or rescheduling.")
            else:
                print(f"✅ No rain expected during your {activity} at {time}. Enjoy!")
        
        elif choice == "3":
            forecast = weather.get_basic_forecast()
            print(f"Forecast: Temp={forecast['temperature']}°C, Rain from {forecast['rain_start']} to {forecast['rain_end']}")
        
        elif choice == "4":
            print("Exiting...")
            break
        else:
            print("Invalid choice.")
