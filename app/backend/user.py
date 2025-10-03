from . import storage

def register_user(username):
    if username in storage.users:
        print("User already exists.")
    else:
        storage.users[username] = {"logs": [], "preferences": {}}
        storage.save_users()
        print(f"User '{username}' registered successfully.")
