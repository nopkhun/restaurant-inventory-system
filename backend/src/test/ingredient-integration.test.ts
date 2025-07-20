import request from 'supertest';
import app from '../app';

// Mock JWT middleware
jest.mock('../middleware/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = {
      userId: 'test-user-id',
      username: 'testuser',
      role: 'admin',
      locationId: 'test-location-id'
    };
    next();
  },
  authorize: () => (_req: any, _res: any, next: any) => {
    next();
  }
}));

// Mock database models
jest.mock('../models/Ingredient', () => {
  const mockIngredient = {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn()
  };
  
  return {
    __esModule: true,
    default: mockIngredient,
    INGREDIENT_CATEGORIES: [
      'เนื้อสัตว์', 'ผัก', 'ผลไม้', 'เครื่องปรุง', 'เครื่องเทศ', 
      'น้ำมัน', 'แป้ง', 'นม/ไข่', 'อาหารทะเล', 'เครื่องดื่ม', 'อื่นๆ'
    ],
    INGREDIENT_UNITS: [
      'กิโลกรัม', 'กรัม', 'ลิตร', 'มิลลิลิตร', 'ชิ้น', 
      'ใบ', 'หัว', 'ฟอง', 'แผ่น', 'ขวด', 'กล่อง', 'ถุง'
    ]
  };
});

jest.mock('../models/Supplier', () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn()
  }
}));

describe('Ingredient API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/ingredients/categories', () => {
    it('should return ingredient categories', async () => {
      const response = await request(app)
        .get('/api/v1/ingredients/categories');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toBeDefined();
      expect(Array.isArray(response.body.data.categories)).toBe(true);
    });
  });

  describe('GET /api/v1/ingredients/units', () => {
    it('should return ingredient units', async () => {
      const response = await request(app)
        .get('/api/v1/ingredients/units');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.units).toBeDefined();
      expect(Array.isArray(response.body.data.units)).toBe(true);
    });
  });

  describe('POST /api/v1/ingredients - Validation Tests', () => {
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
        code: 'TEST001',
        name: 'Test Ingredient',
        category: 'invalid_category',
        unit: 'กิโลกรัม',
        cost_per_unit: 25.50,
        min_stock_level: 10
      };

      const response = await request(app)
        .post('/api/v1/ingredients')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid unit', async () => {
      const invalidData = {
        code: 'TEST001',
        name: 'Test Ingredient',
        category: 'ผัก',
        unit: 'invalid_unit',
        cost_per_unit: 25.50,
        min_stock_level: 10
      };

      const response = await request(app)
        .post('/api/v1/ingredients')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/ingredients/:id - Validation Tests', () => {
    it('should return validation error for invalid UUID', async () => {
      const response = await request(app)
        .get('/api/v1/ingredients/invalid-uuid');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});