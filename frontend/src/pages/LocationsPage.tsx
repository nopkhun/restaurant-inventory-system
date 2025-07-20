import React, { useState } from 'react';
import LocationList from '../components/locations/LocationList';
import LocationForm from '../components/locations/LocationForm';
import { Location, CreateLocationData, UpdateLocationData, locationApi } from '../api/locationApi';

const LocationsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddLocation = () => {
    setEditingLocation(null);
    setShowForm(true);
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setShowForm(true);
  };

  const handleDeleteLocation = async (location: Location) => {
    if (!confirm(`คุณต้องการลบสาขา "${location.name}" หรือไม่?`)) {
      return;
    }

    try {
      setLoading(true);
      await locationApi.deleteLocation(location.id);
      alert('ลบสาขาเรียบร้อยแล้ว');
      setRefreshKey(prev => prev + 1); // Trigger refresh
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'เกิดข้อผิดพลาดในการลบสาขา');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (data: CreateLocationData | UpdateLocationData) => {
    try {
      setLoading(true);
      
      if (editingLocation) {
        await locationApi.updateLocation(editingLocation.id, data);
        alert('อัปเดตข้อมูลสาขาเรียบร้อยแล้ว');
      } else {
        await locationApi.createLocation(data as CreateLocationData);
        alert('เพิ่มสาขาใหม่เรียบร้อยแล้ว');
      }
      
      setShowForm(false);
      setEditingLocation(null);
      setRefreshKey(prev => prev + 1); // Trigger refresh
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingLocation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">จัดการสาขา</h1>
              <p className="mt-1 text-sm text-gray-600">
                จัดการข้อมูลสาขาร้านอาหารและครัวกลาง
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button
                onClick={handleAddLocation}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                เพิ่มสาขาใหม่
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {showForm ? (
          <LocationForm
            {...(editingLocation && { location: editingLocation })}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            loading={loading}
          />
        ) : (
          <LocationList
            key={refreshKey}
            onLocationEdit={handleEditLocation}
            onLocationDelete={handleDeleteLocation}
            showActions={true}
          />
        )}
      </div>
    </div>
  );
};

export default LocationsPage;