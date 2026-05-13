import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { supabase } from '../lib/supabase';
import { MapPin, Navigation, Phone, Clock, Search } from 'lucide-react';
import L from 'leaflet';

// Fix for default marker icons in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Haversine formula to calculate distance between two points in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Component to recenter map
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

export default function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [closestBranch, setClosestBranch] = useState(null);
  const [mapCenter, setMapCenter] = useState([14.5995, 120.9842]); // Default: Manila
  const [mapZoom, setMapZoom] = useState(11);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      const { data, error } = await supabase.from('locations').select('*');
      if (error) throw error;
      setLocations(data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  }

  const findClosest = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      setMapCenter([latitude, longitude]);
      setMapZoom(13);

      if (locations.length > 0) {
        let minDistance = Infinity;
        let closest = null;

        locations.forEach(loc => {
          const dist = calculateDistance(latitude, longitude, loc.lat, loc.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closest = { ...loc, distance: dist };
          }
        });

        setClosestBranch(closest);
      }
    }, (error) => {
      alert("Unable to retrieve your location. Please check your browser permissions.");
    });
  };

  const filteredLocations = locations.filter(loc => 
    loc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    loc.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container" style={{paddingTop: '3rem', paddingBottom: '5rem'}}>
      <div style={{textAlign: 'center', marginBottom: '3rem'}}>
        <h1 className="text-gradient" style={{fontSize: '3rem', marginBottom: '1rem'}}>Find a Red Ribbon Near You</h1>
        <p style={{color: '#666', fontSize: '1.1rem'}}>Satisfy your cravings at our nearest branch.</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', height: '600px'}}>
        {/* Sidebar */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto', paddingRight: '0.5rem'}}>
          <div style={{position: 'relative'}}>
            <input 
              type="text" 
              placeholder="Search branches..." 
              className="form-control"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{paddingLeft: '2.5rem'}}
            />
            <Search size={18} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#888'}} />
          </div>

          <button className="btn btn-primary" onClick={findClosest} style={{width: '100%'}}>
            <Navigation size={18} /> Use My Current Location
          </button>

          {closestBranch && (
            <div style={{background: 'var(--primary-red-pale)', padding: '1.5rem', borderRadius: '15px', border: '1px solid var(--primary-red-light)'}}>
              <p style={{fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary-red)', textTransform: 'uppercase', marginBottom: '0.5rem'}}>Closest to you</p>
              <h3 style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>{closestBranch.name}</h3>
              <p style={{fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem'}}>{closestBranch.address}</p>
              <p style={{fontSize: '0.9rem', fontWeight: '700', color: 'var(--primary-red)'}}>
                {closestBranch.distance.toFixed(2)} km away
              </p>
            </div>
          )}

          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {filteredLocations.map(loc => (
              <div 
                key={loc.id} 
                onClick={() => { setMapCenter([loc.lat, loc.lng]); setMapZoom(15); }}
                style={{
                  padding: '1.25rem', 
                  background: '#fff', 
                  borderRadius: '15px', 
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer',
                  border: mapCenter[0] === loc.lat ? '2px solid var(--primary-red)' : '2px solid transparent',
                  transition: 'all 0.2s'
                }}
              >
                <h4 style={{marginBottom: '0.5rem'}}>{loc.name}</h4>
                <p style={{fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem'}}>{loc.address}</p>
                <div style={{display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#888'}}>
                  <span style={{display: 'flex', alignItems: 'center', gap: '0.25rem'}}><Clock size={14} /> 8:00 AM - 9:00 PM</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map Area */}
        <div style={{borderRadius: '24px', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid #eee', position: 'relative'}}>
          <MapContainer center={mapCenter} zoom={mapZoom} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ChangeView center={mapCenter} zoom={mapZoom} />
            
            {locations.map(loc => (
              <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                <Popup>
                  <div style={{padding: '0.5rem'}}>
                    <h4 style={{margin: '0 0 0.5rem 0'}}>{loc.name}</h4>
                    <p style={{margin: 0, fontSize: '0.85rem'}}>{loc.address}</p>
                    <button 
                      className="btn btn-primary" 
                      style={{marginTop: '1rem', padding: '0.4rem 1rem', fontSize: '0.8rem', width: '100%'}}
                    >
                      Order from here
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={L.divIcon({
                className: 'user-marker',
                html: `<div style="background: #3b82f6; width: 15px; height: 15px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3)"></div>`
              })}>
                <Popup>You are here</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
