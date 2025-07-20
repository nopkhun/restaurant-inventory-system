import React, { useState, useEffect } from 'react';
import { ingredientApi, Ingredient, IngredientSearchParams } from '../../api/ingredientApi';

interface IngredientListProps {
  onEdit?: (ingredient: Ingredient) => void;
  onView?: (ingredient: Ingredient) => void;
}

const IngredientList: React.FC<IngredientListProps> = ({ onEdit, onView }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useState<IngredientSearchParams>({
    page: 1,
    limit: 20,
    is_active: 'true'
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);

  // Load reference data
  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        const [categoriesData, unitsData] = await Promise.all([
          ingredientApi.getCategories(),
          ingredientApi.getUnits()
        ]);
        setCategories(categoriesData.categories);
        setUnits(unitsData.units);
      } catch (err) {
        console.error('Error loading reference data:', err);
      }
    };

    loadReferenceData();
  }, []);

  // Load ingredients
  useEffect(() => {
    loadIngredients();
  }, [searchParams]);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ingredientApi.getIngredients(searchParams);
      setIngredients(response.data.ingredients);
      setPagination(response.data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    const category = formData.get('category') as string;
    const unit = formData.get('unit') as string;
    const is_active = formData.get('is_active') as 'true' | 'false' | 'all';

    const newParams: IngredientSearchParams = {
      ...searchParams,
      page: 1, // Reset to first page when searching
      is_active
    };
    
    if (search) newParams.search = search;
    if (category) newParams.category = category;
    if (unit) newParams.unit = unit;
    
    setSearchParams(newParams);
  };

  const handlePageChange = (page: number) => {
    setSearchParams({ ...searchParams, page });
  };

  const handleToggleStatus = async (ingredient: Ingredient) => {
    try {
      if (ingredient.is_active) {
        await ingredientApi.deactivateIngredient(ingredient.id);
      } else {
        await ingredientApi.reactivateIngredient(ingredient.id);
      }
      loadIngredients(); // Reload the list
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนสถานะ');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(amount);
  };

  if (loading && ingredients.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                ค้นหา
              </label>
              <input
                type="text"
                id="search"
                name="search"
                placeholder="รหัสหรือชื่อวัตถุดิบ"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={searchParams.search || ''}
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                หมวดหมู่
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={searchParams.category || ''}
              >
                <option value="">ทั้งหมด</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                หน่วยนับ
              </label>
              <select
                id="unit"
                name="unit"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={searchParams.unit || ''}
              >
                <option value="">ทั้งหมด</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="is_active" className="block text-sm font-medium text-gray-700 mb-1">
                สถานะ
              </label>
              <select
                id="is_active"
                name="is_active"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={searchParams.is_active}
              >
                <option value="true">ใช้งาน</option>
                <option value="false">ปิดใช้งาน</option>
                <option value="all">ทั้งหมด</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              ค้นหา
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Ingredients Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  รหัส/ชื่อ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หมวดหมู่
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หน่วย/ราคา
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จุดสั่งซื้อ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ซัพพลายเออร์
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  สถานะ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ingredients.map((ingredient) => (
                <tr key={ingredient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {ingredient.code}
                      </div>
                      <div className="text-sm text-gray-500">
                        {ingredient.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {ingredient.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{ingredient.unit}</div>
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(ingredient.cost_per_unit)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ingredient.min_stock_level} {ingredient.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ingredient.supplier?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      ingredient.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {ingredient.is_active ? 'ใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {onView && (
                      <button
                        onClick={() => onView(ingredient)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        ดู
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(ingredient)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        แก้ไข
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleStatus(ingredient)}
                      className={`${
                        ingredient.is_active 
                          ? 'text-red-600 hover:text-red-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {ingredient.is_active ? 'ปิดใช้งาน' : 'เปิดใช้งาน'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ก่อนหน้า
              </button>
              <button
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.total_pages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ถัดไป
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  แสดง <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> ถึง{' '}
                  <span className="font-medium">
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                  </span>{' '}
                  จาก <span className="font-medium">{pagination.total}</span> รายการ
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.current_page - 1)}
                    disabled={pagination.current_page <= 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ก่อนหน้า
                  </button>
                  {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.current_page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.current_page + 1)}
                    disabled={pagination.current_page >= pagination.total_pages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ถัดไป
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay */}
      {loading && ingredients.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">กำลังโหลด...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngredientList;