import React, { useState, useEffect } from 'react';
import { ingredientApi, Ingredient, CreateIngredientData, UpdateIngredientData } from '../../api/ingredientApi';

interface IngredientFormProps {
  ingredient?: Ingredient | undefined;
  onSave: (ingredient: Ingredient) => void;
  onCancel: () => void;
}

const IngredientForm: React.FC<IngredientFormProps> = ({ ingredient, onSave, onCancel }) => {
  const [formData, setFormData] = useState<CreateIngredientData>({
    code: '',
    name: '',
    category: '',
    unit: '',
    cost_per_unit: 0,
    min_stock_level: 0
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reference data and populate form
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, unitsData] = await Promise.all([
          ingredientApi.getCategories(),
          ingredientApi.getUnits()
        ]);
        setCategories(categoriesData.categories);
        setUnits(unitsData.units);

        // Populate form if editing
        if (ingredient) {
          const updateData: CreateIngredientData = {
            code: ingredient.code,
            name: ingredient.name,
            category: ingredient.category,
            unit: ingredient.unit,
            cost_per_unit: ingredient.cost_per_unit,
            min_stock_level: ingredient.min_stock_level
          };
          
          if (ingredient.supplier_id) {
            updateData.supplier_id = ingredient.supplier_id;
          }
          
          if (ingredient.shelf_life_days) {
            updateData.shelf_life_days = ingredient.shelf_life_days;
          }
          
          setFormData(updateData);
        }
      } catch (err) {
        console.error('Error loading reference data:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
      }
    };

    loadData();
  }, [ingredient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === 'cost_per_unit' || name === 'min_stock_level') {
      const numValue = value === '' ? 0 : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else if (name === 'shelf_life_days') {
      const numValue = value === '' ? undefined : parseFloat(value);
      if (numValue !== undefined) {
        setFormData(prev => ({ ...prev, [name]: numValue }));
      } else {
        const { shelf_life_days, ...rest } = formData;
        setFormData(rest);
      }
    } else if (name === 'supplier_id') {
      if (value) {
        setFormData(prev => ({ ...prev, [name]: value }));
      } else {
        const { supplier_id, ...rest } = formData;
        setFormData(rest);
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let savedIngredient: Ingredient;
      
      if (ingredient) {
        // Update existing ingredient
        const updateData: UpdateIngredientData = { ...formData };
        savedIngredient = await ingredientApi.updateIngredient(ingredient.id, updateData);
      } else {
        // Create new ingredient
        savedIngredient = await ingredientApi.createIngredient(formData);
      }

      onSave(savedIngredient);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.error?.details?.[0]?.message ||
                          'เกิดข้อผิดพลาดในการบันทึกข้อมูล';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    return formData.code && 
           formData.name && 
           formData.category && 
           formData.unit && 
           formData.cost_per_unit >= 0 && 
           formData.min_stock_level >= 0;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {ingredient ? 'แก้ไขวัตถุดิบ' : 'เพิ่มวัตถุดิบใหม่'}
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* รหัสวัตถุดิบ */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              รหัสวัตถุดิบ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น TOMATO001"
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              ใช้ตัวอักษรภาษาอังกฤษพิมพ์ใหญ่ ตัวเลข และเครื่องหมาย _ - เท่านั้น
            </p>
          </div>

          {/* ชื่อวัตถุดิบ */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              ชื่อวัตถุดิบ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น มะเขือเทศ"
              required
              disabled={loading}
            />
          </div>

          {/* หมวดหมู่ */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              หมวดหมู่ <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="">เลือกหมวดหมู่</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* หน่วยนับ */}
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
              หน่วยนับ <span className="text-red-500">*</span>
            </label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loading}
            >
              <option value="">เลือกหน่วยนับ</option>
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
          </div>

          {/* ราคาต่อหน่วย */}
          <div>
            <label htmlFor="cost_per_unit" className="block text-sm font-medium text-gray-700 mb-1">
              ราคาต่อหน่วย (บาท) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="cost_per_unit"
              name="cost_per_unit"
              value={formData.cost_per_unit || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
              disabled={loading}
            />
          </div>

          {/* จุดสั่งซื้อ */}
          <div>
            <label htmlFor="min_stock_level" className="block text-sm font-medium text-gray-700 mb-1">
              จุดสั่งซื้อ <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="min_stock_level"
              name="min_stock_level"
              value={formData.min_stock_level || ''}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
              required
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              ระดับสต็อกที่ต้องสั่งซื้อเพิ่ม
            </p>
          </div>

          {/* อายุการเก็บรักษา */}
          <div>
            <label htmlFor="shelf_life_days" className="block text-sm font-medium text-gray-700 mb-1">
              อายุการเก็บรักษา (วัน)
            </label>
            <input
              type="number"
              id="shelf_life_days"
              name="shelf_life_days"
              value={formData.shelf_life_days || ''}
              onChange={handleInputChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ไม่ระบุ"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              จำนวนวันที่สามารถเก็บรักษาได้ (ไม่บังคับ)
            </p>
          </div>

          {/* ซัพพลายเออร์ */}
          <div>
            <label htmlFor="supplier_id" className="block text-sm font-medium text-gray-700 mb-1">
              ซัพพลายเออร์
            </label>
            <input
              type="text"
              id="supplier_id"
              name="supplier_id"
              value={formData.supplier_id || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="รหัสซัพพลายเออร์ (ไม่บังคับ)"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              จะเพิ่มการเลือกซัพพลายเออร์ในอนาคต
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !validateForm()}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                กำลังบันทึก...
              </div>
            ) : (
              ingredient ? 'อัปเดต' : 'บันทึก'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IngredientForm;