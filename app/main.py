from backend import user, weather, storage
from frontend import cli

def main():
    print("=== Welcome to 'Will It Rain On My Parade' MVP ===")
    
    # Load existing users
    storage.load_users()
    
    # Run CLI
    cli.run()

if __name__ == "__main__":
    main()
