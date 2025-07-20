import React, { useState, useEffect } from 'react';
import { Location, CreateLocationData, UpdateLocationData } from '../../api/locationApi';

interface LocationFormProps {
  location?: Location;
  onSubmit: (data: CreateLocationData | UpdateLocationData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const LocationForm: React.FC<LocationFormProps> = ({
  location,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<CreateLocationData>({
    name: '',
    type: 'restaurant_branch',
    address: '',
    phone: '',
    manager_id: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        type: location.type,
        address: location.address || '',
        phone: location.phone || '',
        manager_id: location.manager_id || ''
      });
    }
  }, [location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'กรุณาระบุชื่อสาขา';
    }

    if (!formData.type) {
      newErrors.type = 'กรุณาเลือกประเภทสาขา';
    }

    if (formData.phone && !/^[0-9-+\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'รูปแบบเบอร์โทรไม่ถูกต้อง';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Clean up empty strings
    const submitData: CreateLocationData | UpdateLocationData = {
      name: formData.name,
      type: formData.type,
      ...(formData.address && { address: formData.address }),
      ...(formData.phone && { phone: formData.phone }),
      ...(formData.manager_id && { manager_id: formData.manager_id })
    };

    onSubmit(submitData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {location ? 'แก้ไขข้อมูลสาขา' : 'เพิ่มสาขาใหม่'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อสาขา <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="ระบุชื่อสาขา"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              ประเภทสาขา <span className="text-red-500">*</span>
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.type ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="restaurant_branch">สาขาร้านอาหาร</option>
              <option value="central_kitchen">ครัวกลาง</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            ที่อยู่
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ระบุที่อยู่สาขา"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              เบอร์โทร
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="02-xxx-xxxx"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Manager ID - This would typically be a dropdown of available managers */}
          <div>
            <label htmlFor="manager_id" className="block text-sm font-medium text-gray-700 mb-1">
              รหัสผู้จัดการ
            </label>
            <input
              type="text"
              id="manager_id"
              name="manager_id"
              value={formData.manager_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ระบุรหัสผู้จัดการ (ถ้ามี)"
            />
            <p className="mt-1 text-xs text-gray-500">
              ปล่อยว่างไว้หากยังไม่มีผู้จัดการ
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                กำลังบันทึก...
              </div>
            ) : (
              location ? 'อัปเดต' : 'เพิ่มสาขา'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LocationForm;