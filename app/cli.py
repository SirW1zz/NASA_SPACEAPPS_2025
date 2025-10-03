from assistant import planner

# Example addition to your existing CLI menu
elif choice == "5":
    username = input("Enter username: ")
    if username not in storage.users:
        print("User not found.")
        continue
    planner.generate_advice(username)  # prints advice via notifications
