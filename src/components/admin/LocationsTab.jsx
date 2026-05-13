import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import LocationModal from './LocationModal';
import { MapPin, Edit2, Trash2 } from 'lucide-react';

export default function LocationsTab() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('locations').select('*').order('name');
      if (error) throw error;
      setLocations(data || []);
    } catch (err) {
      console.error("Error fetching locations:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this location?')) return;
    
    try {
      const { error } = await supabase.from('locations').delete().eq('id', id);
      if (error) throw error;
      fetchLocations();
    } catch (err) {
      alert(`Error deleting: ${err.message}`);
    }
  };

  const handleEdit = (loc) => {
    setEditingLocation(loc);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <h2 className="text-primary">Branch Locations</h2>
        <button className="btn btn-primary" onClick={handleAdd}>+ Add Branch</button>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{padding: '2rem', textAlign: 'center'}}>Loading locations...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Branch Name</th>
                <th>Address</th>
                <th>Coordinates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{textAlign: 'center'}}>No branches found. Add some to show on the map.</td>
                </tr>
              ) : (
                locations.map(loc => (
                  <tr key={loc.id}>
                    <td style={{fontWeight: '600'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                        <MapPin size={16} color="var(--primary-red)" />
                        {loc.name}
                      </div>
                    </td>
                    <td style={{maxWidth: '300px', fontSize: '0.9rem', color: '#666'}}>{loc.address}</td>
                    <td style={{fontSize: '0.85rem', color: '#888'}}>
                      {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button 
                          className="btn btn-outline" 
                          style={{padding: '0.4rem', border: '1px solid #ddd'}}
                          onClick={() => handleEdit(loc)}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn btn-outline" 
                          style={{padding: '0.4rem', border: '1px solid #ddd', color: '#dc3545'}}
                          onClick={() => handleDelete(loc.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <LocationModal 
          location={editingLocation} 
          onClose={() => setIsModalOpen(false)} 
          onSave={fetchLocations} 
        />
      )}
    </div>
  );
}
