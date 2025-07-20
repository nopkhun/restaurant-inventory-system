import React, { useState, useEffect } from 'react';
import { Location, LocationFilters, locationApi } from '../../api/locationApi';

interface LocationListProps {
  onLocationSelect?: (location: Location) => void;
  onLocationEdit?: (location: Location) => void;
  onLocationDelete?: (location: Location) => void;
  showActions?: boolean;
}

const LocationList: React.FC<LocationListProps> = ({
  onLocationSelect,
  onLocationEdit,
  onLocationDelete,
  showActions = true
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LocationFilters>({});

  useEffect(() => {
    fetchLocations();
  }, [filters]);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const data = await locationApi.getLocations(filters);
      setLocations(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลสาขา');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof LocationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const getLocationTypeLabel = (type: string) => {
    return type === 'central_kitchen' ? 'ครัวกลาง' : 'สาขาร้านอาหาร';
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">กำลังโหลด...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="text-red-800">
            <p className="font-medium">เกิดข้อผิดพลาด</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={fetchLocations}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ค้นหา
            </label>
            <input
              type="text"
              placeholder="ชื่อสาขาหรือที่อยู่"
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ประเภท
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="central_kitchen">ครัวกลาง</option>
              <option value="restaurant_branch">สาขาร้านอาหาร</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              สถานะ
            </label>
            <select
              value={filters.is_active === undefined ? '' : filters.is_active.toString()}
              onChange={(e) => handleFilterChange('is_active', e.target.value === '' ? undefined : e.target.value === 'true')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">ทั้งหมด</option>
              <option value="true">ใช้งาน</option>
              <option value="false">ปิดใช้งาน</option>
            </select>
          </div>
        </div>
      </div>

      {/* Location List */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {locations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>ไม่พบข้อมูลสาขา</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อสาขา
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ประเภท
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ผู้จัดการ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    เบอร์โทร
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  {showActions && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      การจัดการ
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {locations.map((location) => (
                  <tr 
                    key={location.id}
                    className={`hover:bg-gray-50 ${onLocationSelect ? 'cursor-pointer' : ''}`}
                    onClick={() => onLocationSelect?.(location)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {location.name}
                        </div>
                        {location.address && (
                          <div className="text-sm text-gray-500">
                            {location.address}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        location.type === 'central_kitchen'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {getLocationTypeLabel(location.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {location.manager ? (
                        <div>
                          <div>{location.manager.first_name} {location.manager.last_name}</div>
                          <div className="text-gray-500">{location.manager.email}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">ไม่ได้กำหนด</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {location.phone || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(location.is_active)}
                    </td>
                    {showActions && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {onLocationEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onLocationEdit(location);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              แก้ไข
                            </button>
                          )}
                          {onLocationDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onLocationDelete(location);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              ลบ
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationList;