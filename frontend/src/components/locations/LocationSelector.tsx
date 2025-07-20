import React, { useState, useEffect } from 'react';
import { Location, locationApi } from '../../api/locationApi';

interface LocationSelectorProps {
  selectedLocationId?: string;
  onLocationChange: (location: Location | null) => void;
  filterType?: 'central_kitchen' | 'restaurant_branch';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocationId,
  onLocationChange,
  filterType,
  placeholder = 'เลือกสาขา',
  required = false,
  disabled = false,
  className = ''
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLocations();
  }, [filterType]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const filters = {
        is_active: true,
        ...(filterType && { type: filterType })
      };
      const data = await locationApi.getLocations(filters);
      setLocations(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสาขา');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const locationId = e.target.value;
    if (locationId) {
      const selectedLocation = locations.find(loc => loc.id === locationId);
      onLocationChange(selectedLocation || null);
    } else {
      onLocationChange(null);
    }
  };

  const getLocationLabel = (location: Location) => {
    const typeLabel = location.type === 'central_kitchen' ? 'ครัวกลาง' : 'สาขา';
    return `${location.name} (${typeLabel})`;
  };

  if (loading) {
    return (
      <select 
        disabled 
        className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 ${className}`}
      >
        <option>กำลังโหลด...</option>
      </select>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <select 
          disabled 
          className={`w-full px-3 py-2 border border-red-300 rounded-md bg-red-50 ${className}`}
        >
          <option>เกิดข้อผิดพลาด</option>
        </select>
        <button
          onClick={fetchLocations}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <select
      value={selectedLocationId || ''}
      onChange={handleChange}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'
      } ${className}`}
    >
      <option value="">{placeholder}</option>
      {locations.map((location) => (
        <option key={location.id} value={location.id}>
          {getLocationLabel(location)}
        </option>
      ))}
    </select>
  );
};

export default LocationSelector;