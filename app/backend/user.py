class UserProfile:
    def __init__(self, user_data):
        self.user_id = user_data.get("id")
        self.name = user_data.get("name")
        self.health = user_data.get("health", {})
        self.preferences = user_data.get("preferences", {})
