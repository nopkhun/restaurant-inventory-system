import React, { useState } from 'react';
import IngredientList from '../components/ingredients/IngredientList';
import IngredientForm from '../components/ingredients/IngredientForm';
import { Ingredient } from '../api/ingredientApi';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

const IngredientsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | undefined>();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreate = () => {
    setSelectedIngredient(undefined);
    setViewMode('create');
  };

  const handleEdit = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setViewMode('edit');
  };

  const handleView = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setViewMode('view');
  };

  const handleSave = () => {
    setViewMode('list');
    setSelectedIngredient(undefined);
    setRefreshKey(prev => prev + 1); // Force refresh the list
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedIngredient(undefined);
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const { ingredientApi } = await import('../api/ingredientApi');
      const blob = await ingredientApi.exportIngredients(format);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ingredients.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">จัดการวัตถุดิบ</h1>
              <p className="mt-2 text-gray-600">
                เพิ่ม แก้ไข และจัดการข้อมูลวัตถุดิบทั้งหมด
              </p>
            </div>
            
            {viewMode === 'list' && (
              <div className="flex space-x-3">
                <div className="relative">
                  <button
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={() => {
                      const dropdown = document.getElementById('export-dropdown');
                      dropdown?.classList.toggle('hidden');
                    }}
                  >
                    ส่งออกข้อมูล
                    <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div
                    id="export-dropdown"
                    className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200"
                  >
                    <div className="py-1">
                      <button
                        onClick={() => handleExport('json')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        ส่งออกเป็น JSON
                      </button>
                      <button
                        onClick={() => handleExport('csv')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        ส่งออกเป็น CSV
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="mr-2 -ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  เพิ่มวัตถุดิบใหม่
                </button>
              </div>
            )}

            {viewMode !== 'list' && (
              <button
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <svg className="mr-2 -ml-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                กลับไปรายการ
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          {viewMode === 'list' && (
            <IngredientList
              key={refreshKey}
              onEdit={handleEdit}
              onView={handleView}
            />
          )}

          {(viewMode === 'create' || viewMode === 'edit') && (
            <IngredientForm
              ingredient={selectedIngredient}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}

          {viewMode === 'view' && selectedIngredient && (
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  รายละเอียดวัตถุดิบ
                </h2>
                <button
                  onClick={() => handleEdit(selectedIngredient)}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  แก้ไข
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">รหัสวัตถุดิบ</h3>
                  <p className="text-lg text-gray-900">{selectedIngredient.code}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">ชื่อวัตถุดิบ</h3>
                  <p className="text-lg text-gray-900">{selectedIngredient.name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">หมวดหมู่</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {selectedIngredient.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">หน่วยนับ</h3>
                  <p className="text-lg text-gray-900">{selectedIngredient.unit}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">ราคาต่อหน่วย</h3>
                  <p className="text-lg font-medium text-green-600">
                    {new Intl.NumberFormat('th-TH', {
                      style: 'currency',
                      currency: 'THB'
                    }).format(selectedIngredient.cost_per_unit)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">จุดสั่งซื้อ</h3>
                  <p className="text-lg text-gray-900">
                    {selectedIngredient.min_stock_level} {selectedIngredient.unit}
                  </p>
                </div>

                {selectedIngredient.shelf_life_days && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">อายุการเก็บรักษา</h3>
                    <p className="text-lg text-gray-900">{selectedIngredient.shelf_life_days} วัน</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">ซัพพลายเออร์</h3>
                  <p className="text-lg text-gray-900">
                    {selectedIngredient.supplier?.name || 'ไม่ระบุ'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">สถานะ</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                    selectedIngredient.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedIngredient.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">วันที่สร้าง</h3>
                  <p className="text-lg text-gray-900">
                    {new Date(selectedIngredient.created_at).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      <div
        className="fixed inset-0 z-0"
        onClick={() => {
          const dropdown = document.getElementById('export-dropdown');
          dropdown?.classList.add('hidden');
        }}
      ></div>
    </div>
  );
};

export default IngredientsPage;