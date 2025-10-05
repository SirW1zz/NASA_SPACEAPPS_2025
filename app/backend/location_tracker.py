import sqlite3
from datetime import datetime, timedelta
from typing import List, Tuple, Dict
import os

DB_FILE = "location_history.db"

class LocationTracker:
    """Track and store user location history."""
    
    def __init__(self):
        self.conn = sqlite3.connect(DB_FILE, check_same_thread=False)
        self.create_tables()
    
    def create_tables(self):
        """Create location history table if it doesn't exist."""
        cursor = self.conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS location_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                timestamp TEXT NOT NULL,
                day_of_week INTEGER,
                hour INTEGER,
                accuracy REAL
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS known_places (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                visit_count INTEGER DEFAULT 1,
                last_visited TEXT
            )
        ''')
        
        self.conn.commit()
    
    def add_location(self, lat: float, lon: float, accuracy: float = None) -> None:
        """Add a new location point to history."""
        cursor = self.conn.cursor()
        now = datetime.now()
        
        cursor.execute('''
            INSERT INTO location_history (latitude, longitude, timestamp, day_of_week, hour, accuracy)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (lat, lon, now.isoformat(), now.weekday(), now.hour, accuracy))
        
        self.conn.commit()
        print(f"📍 Location saved: ({lat:.4f}, {lon:.4f})")
    
    def get_recent_locations(self, hours: int = 24) -> List[Tuple]:
        """Get locations from the last X hours."""
        cursor = self.conn.cursor()
        cutoff = (datetime.now() - timedelta(hours=hours)).isoformat()
        
        cursor.execute('''
            SELECT latitude, longitude, timestamp FROM location_history
            WHERE timestamp >= ?
            ORDER BY timestamp DESC
        ''', (cutoff,))
        
        return cursor.fetchall()
    
    def get_all_locations(self) -> List[Tuple]:
        """Get all location history."""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT latitude, longitude, timestamp, day_of_week, hour FROM location_history
            ORDER BY timestamp DESC
        ''')
        return cursor.fetchall()
    
    def get_location_count(self) -> int:
        """Get total number of tracked locations."""
        cursor = self.conn.cursor()
        cursor.execute('SELECT COUNT(*) FROM location_history')
        return cursor.fetchone()[0]
    
    def clear_old_data(self, days: int = 30):
        """Clear location data older than X days."""
        cursor = self.conn.cursor()
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        cursor.execute('DELETE FROM location_history WHERE timestamp < ?', (cutoff,))
        self.conn.commit()
        print(f"🗑️ Cleared location data older than {days} days")
    
    def add_known_place(self, name: str, lat: float, lon: float):
        """Add or update a known place (home, work, etc.)."""
        cursor = self.conn.cursor()
        
        # Check if place already exists nearby (within 200m)
        cursor.execute('''
            SELECT id, visit_count FROM known_places
            WHERE ABS(latitude - ?) < 0.002 AND ABS(longitude - ?) < 0.002
        ''', (lat, lon))
        
        result = cursor.fetchone()
        
        if result:
            # Update visit count
            place_id, visit_count = result
            cursor.execute('''
                UPDATE known_places 
                SET visit_count = ?, last_visited = ?, name = ?
                WHERE id = ?
            ''', (visit_count + 1, datetime.now().isoformat(), name, place_id))
        else:
            # Insert new place
            cursor.execute('''
                INSERT INTO known_places (name, latitude, longitude, last_visited)
                VALUES (?, ?, ?, ?)
            ''', (name, lat, lon, datetime.now().isoformat()))
        
        self.conn.commit()
    
    def get_known_places(self) -> List[Dict]:
        """Get all known places."""
        cursor = self.conn.cursor()
        cursor.execute('''
            SELECT name, latitude, longitude, visit_count, last_visited 
            FROM known_places
            ORDER BY visit_count DESC
        ''')
        
        places = []
        for row in cursor.fetchall():
            places.append({
                'name': row[0],
                'latitude': row[1],
                'longitude': row[2],
                'visit_count': row[3],
                'last_visited': row[4]
            })
        
        return places
    
    def close(self):
        """Close database connection."""
        self.conn.close()
