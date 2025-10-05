from sklearn.cluster import DBSCAN
import numpy as np
from typing import List, Tuple, Dict
from datetime import datetime
from geopy.distance import geodesic

from app.backend.location_tracker import LocationTracker

class PatternRecognizer:
    """Use ML to recognize location patterns and predict destinations."""
    
    def __init__(self):
        self.tracker = LocationTracker()
    
    def cluster_locations(self) -> List[Dict]:
        """Use DBSCAN clustering to find frequently visited places."""
        locations = self.tracker.get_all_locations()
        
        if len(locations) < 10:
            print("⚠️ Not enough location data for pattern recognition (need at least 10 points)")
            return []
        
        # Extract coordinates
        coords = np.array([(lat, lon) for lat, lon, _, _, _ in locations])
        
        # DBSCAN clustering (eps=0.005 ≈ 500m radius, min_samples=3)
        clustering = DBSCAN(eps=0.005, min_samples=3).fit(coords)
        labels = clustering.labels_
        
        # Group clusters
        clusters = {}
        for idx, label in enumerate(labels):
            if label == -1:  # Noise point
                continue
            
            if label not in clusters:
                clusters[label] = []
            
            clusters[label].append(locations[idx])
        
        # Calculate cluster centroids and visit counts
        recognized_places = []
        for label, points in clusters.items():
            # Calculate centroid
            lats = [p[0] for p in points]
            lons = [p[1] for p in points]
            centroid_lat = np.mean(lats)
            centroid_lon = np.mean(lons)
            
            # Determine most common time of visit
            hours = [p[4] for p in points]
            most_common_hour = max(set(hours), key=hours.count)
            
            # Determine most common day
            days = [p[3] for p in points]
            most_common_day = max(set(days), key=days.count)
            
            recognized_places.append({
                'latitude': centroid_lat,
                'longitude': centroid_lon,
                'visit_count': len(points),
                'typical_hour': most_common_hour,
                'typical_day': most_common_day,
                'label': self._guess_place_label(most_common_hour, most_common_day)
            })
        
        # Sort by visit frequency
        recognized_places.sort(key=lambda x: x['visit_count'], reverse=True)
        
        # Auto-label top places
        if len(recognized_places) > 0:
            recognized_places[0]['label'] = 'Home'
        if len(recognized_places) > 1:
            recognized_places[1]['label'] = 'Work/School'
        
        # Save to known places
        for place in recognized_places:
            self.tracker.add_known_place(
                place['label'],
                place['latitude'],
                place['longitude']
            )
        
        print(f"🧠 Recognized {len(recognized_places)} frequent places")
        return recognized_places
    
    def _guess_place_label(self, hour: int, day: int) -> str:
        """Guess place type based on visit patterns."""
        # Weeknight evening = likely home
        if 18 <= hour <= 23 and day < 5:
            return "Home"
        # Weekday morning/afternoon = likely work/school
        elif 8 <= hour <= 17 and day < 5:
            return "Work/School"
        # Weekend day = could be anything
        elif day >= 5:
            return "Weekend Location"
        else:
            return "Unknown Place"
    
    def predict_destination(self, current_lat: float, current_lon: float) -> Dict:
        """Predict where user is going based on current location and time."""
        now = datetime.now()
        current_hour = now.hour
        current_day = now.weekday()
        
        # Get known places
        known_places = self.tracker.get_known_places()
        
        if not known_places:
            print("⚠️ No known places yet, run pattern recognition first")
            return None
        
        # Calculate distance to each known place
        for place in known_places:
            place_coords = (place['latitude'], place['longitude'])
            current_coords = (current_lat, current_lon)
            place['distance'] = geodesic(current_coords, place_coords).meters
        
        # Filter out places we're currently at (within 100m)
        destinations = [p for p in known_places if p['distance'] > 100]
        
        if not destinations:
            return None
        
        # Simple heuristic prediction based on time and day
        # Morning on weekday → likely going to work/school
        if 6 <= current_hour <= 9 and current_day < 5:
            for place in destinations:
                if 'Work' in place['name'] or 'School' in place['name']:
                    return place
        
        # Evening on weekday → likely going home
        elif 16 <= current_hour <= 20 and current_day < 5:
            for place in destinations:
                if 'Home' in place['name']:
                    return place
        
        # Default: return closest frequent place
        destinations.sort(key=lambda x: x['visit_count'], reverse=True)
        return destinations[0] if destinations else None
