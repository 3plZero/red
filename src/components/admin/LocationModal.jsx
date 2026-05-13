import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

function MapPicker({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng);
    },
  });
  return null;
}

export default function LocationModal({ location, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: location?.name || '',
    address: location?.address || '',
    lat: location?.lat || 14.5995, // Default Manila
    lng: location?.lng || 120.9842
  });
  const [loading, setLoading] = useState(false);

  const handleMapPick = (latlng) => {
    setFormData(prev => ({
      ...prev,
      lat: latlng.lat,
      lng: latlng.lng
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const locationData = {
        name: formData.name,
        address: formData.address,
        lat: parseFloat(formData.lat),
        lng: parseFloat(formData.lng)
      };

      if (location?.id) {
        const { error } = await supabase
          .from('locations')
          .update(locationData)
          .eq('id', location.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('locations')
          .insert([locationData]);
        if (error) throw error;
      }
      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving location:", err);
      alert(`Error saving location: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{display: 'flex'}}>
      <div className="modal-content" style={{maxWidth: '800px', gridTemplateColumns: '1.2fr 1fr', padding: '0', gap: '0'}}>
        <button className="modal-close" onClick={onClose} style={{zIndex: 1000}}>×</button>
        
        {/* Map Side */}
        <div style={{height: '500px', background: '#eee', position: 'relative'}}>
          <MapContainer 
            center={[formData.lat, formData.lng]} 
            zoom={13} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapPicker onPick={handleMapPick} />
            <Marker position={[formData.lat, formData.lng]} icon={DefaultIcon} />
          </MapContainer>
          <div style={{position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', background: 'rgba(255,255,255,0.9)', padding: '0.5rem', borderRadius: '8px', zIndex: 1000, fontSize: '0.8rem', textAlign: 'center'}}>
            Click on the map to pin the branch location
          </div>
        </div>

        {/* Form Side */}
        <div style={{padding: '2.5rem'}}>
          <h2 style={{marginBottom: '1.5rem'}}>{location ? 'Edit Location' : 'Add New Location'}</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Branch Name</label>
              <input 
                type="text" 
                className="form-control" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Red Ribbon SM Megamall"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Address</label>
              <textarea 
                className="form-control" 
                required
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="e.g. Level 2, Building A, SM Megamall..."
                style={{resize: 'none'}}
              />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem'}}>
              <div className="form-group" style={{marginBottom: '0'}}>
                <label className="form-label">Latitude</label>
                <input 
                  type="number" 
                  step="any"
                  className="form-control" 
                  required
                  value={formData.lat}
                  onChange={(e) => setFormData({...formData, lat: e.target.value})}
                />
              </div>
              <div className="form-group" style={{marginBottom: '0'}}>
                <label className="form-label">Longitude</label>
                <input 
                  type="number" 
                  step="any"
                  className="form-control" 
                  required
                  value={formData.lng}
                  onChange={(e) => setFormData({...formData, lng: e.target.value})}
                />
              </div>
            </div>

            <div style={{marginTop: '2rem', display: 'flex', gap: '1rem'}}>
              <button type="button" className="btn btn-outline" onClick={onClose} style={{flex: 1}}>Cancel</button>
              <button type="submit" className="btn btn-primary" style={{flex: 1}} disabled={loading}>
                {loading ? 'Saving...' : (location ? 'Update' : 'Add Location')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
