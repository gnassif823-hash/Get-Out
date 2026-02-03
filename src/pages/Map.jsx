import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Search } from 'lucide-react';
import './Map.css';

// Fix for default marker icon in React-Leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapPage = () => {
    // Mock available friends
    const availableFriends = [
        { id: 1, name: 'George', lat: 40.7128, lng: -74.0060, location: 'Starbucks Downtown' },
        { id: 4, name: 'Jessica', lat: 40.785091, lng: -73.968285, location: 'Central Park' },
    ];

    const nearbyPlaces = [
        { id: 101, name: "Joe's Pizza", type: "Restaurant" },
        { id: 102, name: "The Grind Cafe", type: "Cafe" },
    ];

    return (
        <div className="page-container map-page">
            <div className="map-sidebar">
                <div className="search-box">
                    <Search size={20} className="search-icon" />
                    <input type="text" placeholder="Search cafes, spots..." />
                </div>

                <div className="nearby-list">
                    <h3>Nearby Spots</h3>
                    {nearbyPlaces.map(place => (
                        <div key={place.id} className="place-item">
                            <span className="place-name">{place.name}</span>
                            <span className="place-type">{place.type}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="map-view">
                <MapContainer center={[40.730610, -73.935242]} zoom={12} scrollWheelZoom={true} className="leaflet-map">
                    {/* Using CartoDB Dark Matter tiles for Deep Dark Mode aesthetic */}
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {availableFriends.map(friend => (
                        <Marker key={friend.id} position={[friend.lat, friend.lng]}>
                            <Popup>
                                <div className="map-popup">
                                    <b>{friend.name}</b>
                                    <br />
                                    {friend.location}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapPage;
