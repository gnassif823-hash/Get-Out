import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../supabaseClient';
import { Search } from 'lucide-react';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import './Map.css';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when location changes
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
}

const MapPage = () => {
    const { user, updateStatus } = useAuth();
    const [friends, setFriends] = useState([]);
    const [myLocation, setMyLocation] = useState(null); // [lat, lng]

    // 1. Fetch Friends from Supabase
    const fetchFriends = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .neq('status', 'offline'); // Only show online friends

        if (data) setFriends(data);
    };

    useEffect(() => {
        fetchFriends();

        // Subscribe to profile changes (position updates)
        const channel = supabase
            .channel('public:profiles:map')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchFriends)
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    // 2. Track Self Location
    useEffect(() => {
        if (!user || !navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setMyLocation([latitude, longitude]);

                // Update DB with new coordinates if status is 'available'
                // Storing lat,lng string in 'location' column for simplicity, 
                // ideally use PostGIS but string is fine for prototype.
                const locationStr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
                if (user.status === 'available') {
                    updateStatus(user.status, locationStr, user.time_note);
                }
            },
            (err) => console.error(err),
            { enableHighAccuracy: true }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [user]); // Re-run if user/status changes logic needed

    // Helper to parse location string "lat, lng" to [lat, lng] array
    const parseLocation = (locStr) => {
        if (!locStr || !locStr.includes(',')) return null;
        const [lat, lng] = locStr.split(',').map(s => parseFloat(s.trim()));
        if (isNaN(lat) || isNaN(lng)) return null;
        return [lat, lng];
    };

    return (
        <div className="page-container map-page">
            <div className="map-sidebar">
                <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input type="text" placeholder="Search cafes, spots..." />
                </div>

                <div className="nearby-list">
                    <h3>Active Squad</h3>
                    {friends.length === 0 ? <p>No one available.</p> : (
                        friends.map(friend => (
                            <div key={friend.id} className="place-item">
                                <span className="place-name">{friend.name}</span>
                                <span className="place-type">{friend.status}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="map-view">
                <MapContainer center={myLocation || [40.730610, -73.935242]} zoom={13} scrollWheelZoom={true} className="leaflet-map">
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {myLocation && <ChangeView center={myLocation} />}

                    {/* Render Friends Markers */}
                    {friends.map(friend => {
                        const pos = parseLocation(friend.location);
                        if (!pos) return null;

                        return (
                            <Marker key={friend.id} position={pos}>
                                <Popup>
                                    <div className="map-popup">
                                        <b>{friend.name}</b>
                                        <br />
                                        {friend.time_note || 'Chilling'}
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapPage;
