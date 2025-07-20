import request from 'supertest';
import app from '../app';
import Ingredient, { INGREDIENT_CATEGORIES, INGREDIENT_UNITS } from '../models/Ingredient';
import Supplier from '../models/Supplier';

// Mock the models
jest.mock('../models/Ingredient');
jest.mock('../models/Supplier');

const MockIngredient = Ingredient as jest.Mocked<typeof Ingredient>;
const MockSupplier = Supplier as jest.Mocked<typeof Supplier>;

// Mock JWT middleware
jest.mock('../middleware/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      username: 'testuser',
      role: 'admin',
      location_id: 'test-location-id'
    };
    next();
  },
  authorize: () => (_req: any, _res: any, next: any) => {
    next();
  }
}));

describe('Ingredient Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/ingredients/categories', () => {
    it('should return ingredient categories', async () => {
      const response = await request(app)
        .get('/api/v1/ingredients/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toEqual(INGREDIENT_CATEGORIES);
    });
  });

  describe('GET /api/v1/ingredients/units', () => {
    it('should return ingredient units', async () => {
      const response = await request(app)
        .get('/api/v1/ingredients/units');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.units).toEqual(INGREDIENT_UNITS);
    });
  });

  describe('POST /api/v1/ingredients', () => {
    const validIngredientData = {
      code: 'TOMATO001',
      name: 'มะเขือเทศ',
      category: 'ผัก',
      unit: 'กิโลกรัม',
      cost_per_unit: 25.50,
      min_stock_level: 10,
      shelf_life_days: 7
    };

    it('should create a new ingredient', async () => {
      const mockCreatedIngredient = {
        id: 'ingredient-123',
        ...validIngredientData,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      MockIngredient.findOne = jest.fn().mockResolvedValue(null); // No existing ingredient
      MockIngredient.create = jest.fn().mockResolvedValue(mockCreatedIngredient);
      MockIngredient.findByPk = jest.fn().mockResolvedValue({
        ...mockCreatedIngredient,
        supplier: null
      });

      const response = await request(app)
        .post('/api/v1/ingredients')
        .send(validIngredientData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ingredient.code).toBe(validIngredientData.code);
      expect(response.body.data.ingredient.name).toBe(validIngredientData.name);
      expect(response.body.message).toBe('สร้างวัตถุดิบใหม่เรียบร้อยแล้ว');
      expect(MockIngredient.create).toHaveBeenCalledWith(validIngredientData);
    });

    it('should return validation error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/ingredients')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid category', async () => {
      const invalidData = {
        ...validIngredientData,
        category: 'invalid_category'
      };

      // Reset all mocks to ensure validation runs
      jest.clearAllMocks();

      const response = await request(app)
        .post('/api/v1/ingredients')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid unit', async () => {
      const invalidData = {
        ...validIngredientData,
        unit: 'invalid_unit'
      };

      // Reset all mocks to ensure validation runs
      jest.clearAllMocks();

      const response = await request(app)
        .post('/api/v1/ingredients')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return error for duplicate ingredient code', async () => {
      MockIngredient.findOne = jest.fn().mockResolvedValue({ id: 'existing-id' });

      const response = await request(app)
        .post('/api/v1/ingredients')
        .send(validIngredientData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
      expect(response.body.error.message).toBe('รหัสวัตถุดิบนี้มีอยู่ในระบบแล้ว');
    });

    it('should validate supplier exists when provided', async () => {
      const dataWithSupplier = {
        ...validIngredientData,
        supplier_id: '550e8400-e29b-41d4-a716-446655440001'
      };

      MockIngredient.findOne = jest.fn().mockResolvedValue(null);
      MockSupplier.findByPk = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/ingredients')
        .send(dataWithSupplier);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SUPPLIER_NOT_FOUND');
      expect(MockSupplier.findByPk).toHaveBeenCalledWith('550e8400-e29b-41d4-a716-446655440001');
    });

    it('should create ingredient with valid supplier', async () => {
      const mockSupplier = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Supplier'
      };

      const dataWithSupplier = {
        ...validIngredientData,
        supplier_id: mockSupplier.id
      };

      const mockCreatedIngredient = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        ...dataWithSupplier,
        is_active: true
      };

      MockIngredient.findOne = jest.fn().mockResolvedValue(null);
      MockSupplier.findByPk = jest.fn().mockResolvedValue(mockSupplier);
      MockIngredient.create = jest.fn().mockResolvedValue(mockCreatedIngredient);
      MockIngredient.findByPk = jest.fn().mockResolvedValue({
        ...mockCreatedIngredient,
        supplier: mockSupplier
      });

      const response = await request(app)
        .post('/api/v1/ingredients')
        .send(dataWithSupplier);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ingredient.supplier_id).toBe(mockSupplier.id);
    });
  });

  describe('GET /api/v1/ingredients', () => {
    const mockIngredients = [
      {
        id: 'ingredient-1',
        code: 'TOMATO001',
        name: 'มะเขือเทศ',
        category: 'ผัก',
        unit: 'กิโลกรัม',
        cost_per_unit: 25.50,
        is_active: true,
        supplier: { id: 'supplier-1', name: 'Supplier 1' }
      },
      {
        id: 'ingredient-2',
        code: 'ONION001',
        name: 'หัวหอม',
        category: 'ผัก',
        unit: 'กิโลกรัม',
        cost_per_unit: 30.00,
        is_active: true,
        supplier: null
      }
    ];

    it('should get all ingredients with pagination', async () => {
      // Mock the Sequelize methods properly
      (MockIngredient.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: mockIngredients
      });

      const response = await request(app)
        .get('/api/v1/ingredients');

      if (response.status !== 200) {
        console.log('Response body:', response.body);
        console.log('Response status:', response.status);
      }

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ingredients).toHaveLength(2);
      expect(response.body.data.pagination).toEqual({
        current_page: 1,
        per_page: 20,
        total: 2,
        total_pages: 1
      });
    });

    it('should filter ingredients by category', async () => {
      const vegetableIngredients = mockIngredients.filter(ing => ing.category === 'ผัก');
      (MockIngredient.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: vegetableIngredients
      });

      const response = await request(app)
        .get('/api/v1/ingredients')
        .query({ category: 'ผัก' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ingredients).toHaveLength(2);
    });

    it('should search ingredients by name or code', async () => {
      const searchResults = [mockIngredients[0]];
      (MockIngredient.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 1,
        rows: searchResults
      });

      const response = await request(app)
        .get('/api/v1/ingredients')
        .query({ search: 'มะเขือเทศ' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ingredients).toHaveLength(1);
    });

    it('should filter by active status', async () => {
      (MockIngredient.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 2,
        rows: mockIngredients
      });

      const response = await request(app)
        .get('/api/v1/ingredients?is_active=true');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle pagination parameters', async () => {
      (MockIngredient.findAndCountAll as jest.Mock).mockResolvedValue({
        count: 50,
        rows: mockIngredients
      });

      const response = await request(app)
        .get('/api/v1/ingredients?page=2&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.current_page).toBe(2);
      expect(response.body.data.pagination.per_page).toBe(10);
      expect(response.body.data.pagination.total_pages).toBe(5);
    });
  });

  describe('GET /api/v1/ingredients/:id', () => {
    const mockIngredient = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      code: 'TOMATO001',
      name: 'มะเขือเทศ',
      category: 'ผัก',
      unit: 'กิโลกรัม',
      cost_per_unit: 25.50,
      is_active: true,
      supplier: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Test Supplier',
        contact_person: 'John Doe',
        phone: '02-123-4567',
        email: 'supplier@test.com'
      }
    };

    it('should get ingredient by ID', async () => {
      MockIngredient.findByPk = jest.fn().mockResolvedValue(mockIngredient);

      const response = await request(app)
        .get(`/api/v1/ingredients/${mockIngredient.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ingredient.id).toBe(mockIngredient.id);
      expect(response.body.data.ingredient.supplier).toBeDefined();
    });

    it('should return 404 for non-existent ingredient', async () => {
      (MockIngredient.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/ingredients/550e8400-e29b-41d4-a716-446655440999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INGREDIENT_NOT_FOUND');
    });

    it('should return validation error for invalid UUID', async () => {
      const response = await request(app)
        .get('/api/v1/ingredients/invalid-uuid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PUT /api/v1/ingredients/:id', () => {
    const mockIngredient = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      code: 'TOMATO001',
      name: 'มะเขือเทศ',
      category: 'ผัก',
      unit: 'กิโลกรัม',
      cost_per_unit: 25.50,
      is_active: true,
      update: jest.fn()
    };

    it('should update ingredient', async () => {
      const updateData = {
        name: 'มะเขือเทศสด',
        cost_per_unit: 28.00,
        min_stock_level: 15
      };

      const updatedIngredient = { ...mockIngredient, ...updateData };

      MockIngredient.findByPk = jest.fn()
        .mockResolvedValueOnce(mockIngredient) // First call for finding ingredient
        .mockResolvedValueOnce({ ...updatedIngredient, supplier: null }); // Second call for returning updated ingredient

      mockIngredient.update.mockResolvedValue(updatedIngredient);

      const response = await request(app)
        .put(`/api/v1/ingredients/${mockIngredient.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ingredient.name).toBe(updateData.name);
      expect(response.body.data.ingredient.cost_per_unit).toBe(updateData.cost_per_unit);
      expect(response.body.message).toBe('อัปเดตข้อมูลวัตถุดิบเรียบร้อยแล้ว');
      expect(mockIngredient.update).toHaveBeenCalledWith(updateData);
    });

    it('should return 404 for non-existent ingredient', async () => {
      (MockIngredient.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/v1/ingredients/550e8400-e29b-41d4-a716-446655440999')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INGREDIENT_NOT_FOUND');
    });

    it('should prevent duplicate codes when updating', async () => {
      const updateData = { code: 'EXISTING_CODE' };

      MockIngredient.findByPk = jest.fn().mockResolvedValue(mockIngredient);
      MockIngredient.findOne = jest.fn().mockResolvedValue({ id: 'other-ingredient' });

      const response = await request(app)
        .put(`/api/v1/ingredients/${mockIngredient.id}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_ENTRY');
    });

    it('should validate supplier when updating', async () => {
      const updateData = { supplier_id: '550e8400-e29b-41d4-a716-446655440001' };

      MockIngredient.findByPk = jest.fn().mockResolvedValue(mockIngredient);
      MockSupplier.findByPk = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/v1/ingredients/${mockIngredient.id}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('SUPPLIER_NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/ingredients/:id/deactivate', () => {
    const mockIngredient = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      code: 'TOMATO001',
      name: 'มะเขือเทศ',
      is_active: true,
      update: jest.fn()
    };

    it('should deactivate ingredient', async () => {
      MockIngredient.findByPk = jest.fn().mockResolvedValue(mockIngredient);
      mockIngredient.update.mockResolvedValue({ ...mockIngredient, is_active: false });

      const response = await request(app)
        .patch(`/api/v1/ingredients/${mockIngredient.id}/deactivate`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('ปิดการใช้งานวัตถุดิบเรียบร้อยแล้ว');
      expect(mockIngredient.update).toHaveBeenCalledWith({ is_active: false });
    });

    it('should return 404 for non-existent ingredient', async () => {
      (MockIngredient.findByPk as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .patch('/api/v1/ingredients/550e8400-e29b-41d4-a716-446655440999/deactivate');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INGREDIENT_NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/ingredients/:id/reactivate', () => {
    const mockIngredient = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      code: 'TOMATO001',
      name: 'มะเขือเทศ',
      is_active: false,
      update: jest.fn()
    };

    it('should reactivate ingredient', async () => {
      MockIngredient.findByPk = jest.fn().mockResolvedValue(mockIngredient);
      mockIngredient.update.mockResolvedValue({ ...mockIngredient, is_active: true });

      const response = await request(app)
        .patch(`/api/v1/ingredients/${mockIngredient.id}/reactivate`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('เปิดการใช้งานวัตถุดิบเรียบร้อยแล้ว');
      expect(mockIngredient.update).toHaveBeenCalledWith({ is_active: true });
    });
  });

  describe('POST /api/v1/ingredients/bulk-import', () => {
    const validBulkData = {
      ingredients: [
        {
          code: 'BULK001',
          name: 'วัตถุดิบ 1',
          category: 'ผัก',
          unit: 'กิโลกรัม',
          cost_per_unit: 25.00,
          min_stock_level: 10
        },
        {
          code: 'BULK002',
          name: 'วัตถุดิบ 2',
          category: 'เนื้อสัตว์',
          unit: 'กิโลกรัม',
          cost_per_unit: 150.00,
          min_stock_level: 5
        }
      ]
    };

    it('should bulk import ingredients successfully', async () => {
      MockIngredient.findOne = jest.fn().mockResolvedValue(null); // No existing ingredients
      MockIngredient.create = jest.fn()
        .mockResolvedValueOnce({ id: 'ing-1', code: 'BULK001', name: 'วัตถุดิบ 1' })
        .mockResolvedValueOnce({ id: 'ing-2', code: 'BULK002', name: 'วัตถุดิบ 2' });

      const response = await request(app)
        .post('/api/v1/ingredients/bulk-import')
        .send(validBulkData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toHaveLength(2);
      expect(response.body.data.errors).toHaveLength(0);
      expect(response.body.data.total).toBe(2);
    });

    it('should handle duplicate codes in bulk import', async () => {
      MockIngredient.findOne = jest.fn()
        .mockResolvedValueOnce({ id: 'existing' }) // First ingredient exists
        .mockResolvedValueOnce(null); // Second ingredient doesn't exist
      MockIngredient.create = jest.fn()
        .mockResolvedValueOnce({ id: 'ing-2', code: 'BULK002', name: 'วัตถุดิบ 2' });

      const response = await request(app)
        .post('/api/v1/ingredients/bulk-import')
        .send(validBulkData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.success).toHaveLength(1);
      expect(response.body.data.errors).toHaveLength(1);
      expect(response.body.data.errors[0].error).toBe('รหัสวัตถุดิบนี้มีอยู่ในระบบแล้ว');
    });

    it('should return validation error for invalid bulk data', async () => {
      const invalidData = {
        ingredients: [
          {
            code: 'BULK001',
            // Missing required fields
          }
        ]
      };

      const response = await request(app)
        .post('/api/v1/ingredients/bulk-import')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/ingredients/export', () => {
    const mockIngredients = [
      {
        id: 'ingredient-1',
        code: 'TOMATO001',
        name: 'มะเขือเทศ',
        category: 'ผัก',
        unit: 'กิโลกรัม',
        cost_per_unit: 25.50,
        min_stock_level: 10,
        shelf_life_days: 7,
        is_active: true,
        supplier: { name: 'Supplier 1' }
      }
    ];

    it('should export ingredients as JSON by default', async () => {
      MockIngredient.findAll = jest.fn().mockResolvedValue(mockIngredients);

      const response = await request(app)
        .get('/api/v1/ingredients/export');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.ingredients).toHaveLength(1);
    });

    it('should export ingredients as CSV when requested', async () => {
      MockIngredient.findAll = jest.fn().mockResolvedValue(mockIngredients);

      const response = await request(app)
        .get('/api/v1/ingredients/export?format=csv');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment; filename="ingredients.csv"');
      expect(response.text).toContain('รหัส,ชื่อ,หมวดหมู่');
      expect(response.text).toContain('TOMATO001,มะเขือเทศ,ผัก');
    });
  });
});