import request from 'supertest';
import app from '../app';
import User, { UserRole } from '../models/User';
import Location, { LocationType } from '../models/Location';

// Mock the models
jest.mock('../models/User');
jest.mock('../models/Location');

const MockUser = User as jest.Mocked<typeof User>;
const MockLocation = Location as jest.Mocked<typeof Location>;

// Mock JWT middleware
jest.mock('../middleware/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = {
      id: 'test-user-id',
      username: 'testuser',
      role: UserRole.ADMIN
    };
    next();
  },
  authorize: () => (_req: any, _res: any, next: any) => {
    next();
  }
}));

describe('Location Management', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/locations', () => {
    it('should create a new location', async () => {
      const locationData = {
        name: 'Test Restaurant',
        type: LocationType.RESTAURANT_BRANCH,
        address: '123 Test Street',
        phone: '02-123-4567'
      };

      const mockCreatedLocation = {
        id: 'location-123',
        ...locationData,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      };

      MockLocation.create = jest.fn().mockResolvedValue(mockCreatedLocation);
      MockLocation.findByPk = jest.fn().mockResolvedValue(mockCreatedLocation);

      const response = await request(app)
        .post('/api/v1/locations')
        .send(locationData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(locationData.name);
      expect(response.body.data.type).toBe(locationData.type);
      expect(response.body.data.address).toBe(locationData.address);
      expect(response.body.data.phone).toBe(locationData.phone);
      expect(MockLocation.create).toHaveBeenCalledWith(locationData);
    });

    it('should return validation error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/locations')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid location type', async () => {
      const locationData = {
        name: 'Test Restaurant',
        type: 'invalid_type',
        address: '123 Test Street'
      };

      const response = await request(app)
        .post('/api/v1/locations')
        .send(locationData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate manager exists when provided', async () => {
      const locationData = {
        name: 'Test Restaurant',
        type: LocationType.RESTAURANT_BRANCH,
        manager_id: 'non-existent-manager'
      };

      MockUser.findByPk = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .post('/api/v1/locations')
        .send(locationData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(MockUser.findByPk).toHaveBeenCalledWith('non-existent-manager');
    });
  });

  describe('GET /api/v1/locations', () => {
    const mockLocations = [
      {
        id: 'location-1',
        name: 'Central Kitchen',
        type: LocationType.CENTRAL_KITCHEN,
        address: '456 Kitchen Street',
        is_active: true
      },
      {
        id: 'location-2',
        name: 'Branch 1',
        type: LocationType.RESTAURANT_BRANCH,
        address: '789 Branch Street',
        is_active: true
      },
      {
        id: 'location-3',
        name: 'Branch 2',
        type: LocationType.RESTAURANT_BRANCH,
        address: '321 Another Street',
        is_active: false
      }
    ];

    it('should get all locations', async () => {
      MockLocation.findAll = jest.fn().mockResolvedValue(mockLocations);

      const response = await request(app)
        .get('/api/v1/locations');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
      expect(MockLocation.findAll).toHaveBeenCalled();
    });

    it('should filter locations by type', async () => {
      const centralKitchens = mockLocations.filter(loc => loc.type === LocationType.CENTRAL_KITCHEN);
      MockLocation.findAll = jest.fn().mockResolvedValue(centralKitchens);

      const response = await request(app)
        .get('/api/v1/locations?type=central_kitchen');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].type).toBe(LocationType.CENTRAL_KITCHEN);
    });

    it('should filter locations by active status', async () => {
      const activeLocations = mockLocations.filter(loc => loc.is_active);
      MockLocation.findAll = jest.fn().mockResolvedValue(activeLocations);

      const response = await request(app)
        .get('/api/v1/locations?is_active=true');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((loc: any) => loc.is_active)).toBe(true);
    });

    it('should search locations by name', async () => {
      const branchLocations = mockLocations.filter(loc => loc.name.includes('Branch'));
      MockLocation.findAll = jest.fn().mockResolvedValue(branchLocations);

      const response = await request(app)
        .get('/api/v1/locations?search=Branch');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('GET /api/v1/locations/:id', () => {
    const mockLocation = {
      id: 'location-123',
      name: 'Test Location',
      type: LocationType.RESTAURANT_BRANCH,
      address: '123 Test Street',
      is_active: true
    };

    it('should get location by ID', async () => {
      MockLocation.findByPk = jest.fn().mockResolvedValue(mockLocation);

      const response = await request(app)
        .get(`/api/v1/locations/${mockLocation.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockLocation.id);
      expect(response.body.data.name).toBe(mockLocation.name);
      expect(MockLocation.findByPk).toHaveBeenCalledWith(mockLocation.id, expect.any(Object));
    });

    it('should return 404 for non-existent location', async () => {
      MockLocation.findByPk = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .get('/api/v1/locations/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LOCATION_NOT_FOUND');
    });
  });

  describe('PUT /api/v1/locations/:id', () => {
    const mockLocation = {
      id: 'location-123',
      name: 'Test Location',
      type: LocationType.RESTAURANT_BRANCH,
      address: '123 Test Street',
      is_active: true,
      update: jest.fn()
    };

    it('should update location', async () => {
      const updateData = {
        name: 'Updated Location',
        address: '456 Updated Street',
        phone: '02-987-6543'
      };

      const updatedLocation = { ...mockLocation, ...updateData };

      MockLocation.findByPk = jest.fn()
        .mockResolvedValueOnce(mockLocation) // First call for finding location
        .mockResolvedValueOnce(updatedLocation); // Second call for returning updated location

      mockLocation.update.mockResolvedValue(updatedLocation);

      const response = await request(app)
        .put(`/api/v1/locations/${mockLocation.id}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.address).toBe(updateData.address);
      expect(response.body.data.phone).toBe(updateData.phone);
      expect(mockLocation.update).toHaveBeenCalled();
    });

    it('should return 404 for non-existent location', async () => {
      MockLocation.findByPk = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .put('/api/v1/locations/non-existent-id')
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LOCATION_NOT_FOUND');
    });

    it('should validate manager exists when updating', async () => {
      MockLocation.findByPk = jest.fn().mockResolvedValue(mockLocation);
      MockUser.findByPk = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/v1/locations/${mockLocation.id}`)
        .send({ manager_id: 'non-existent-manager' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DELETE /api/v1/locations/:id', () => {
    const mockLocation = {
      id: 'location-123',
      name: 'Test Location',
      type: LocationType.RESTAURANT_BRANCH,
      address: '123 Test Street',
      is_active: true,
      update: jest.fn()
    };

    it('should soft delete location', async () => {
      MockLocation.findByPk = jest.fn().mockResolvedValue(mockLocation);
      mockLocation.update.mockResolvedValue({ ...mockLocation, is_active: false });

      const response = await request(app)
        .delete(`/api/v1/locations/${mockLocation.id}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockLocation.update).toHaveBeenCalledWith({ is_active: false });
    });

    it('should return 404 for non-existent location', async () => {
      MockLocation.findByPk = jest.fn().mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/v1/locations/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LOCATION_NOT_FOUND');
    });
  });

  describe('GET /api/v1/locations/hierarchy', () => {
    const mockActiveLocations = [
      {
        id: 'ck-1',
        name: 'Central Kitchen 1',
        type: LocationType.CENTRAL_KITCHEN,
        is_active: true
      },
      {
        id: 'ck-2',
        name: 'Central Kitchen 2',
        type: LocationType.CENTRAL_KITCHEN,
        is_active: true
      },
      {
        id: 'branch-1',
        name: 'Branch 1',
        type: LocationType.RESTAURANT_BRANCH,
        is_active: true
      },
      {
        id: 'branch-2',
        name: 'Branch 2',
        type: LocationType.RESTAURANT_BRANCH,
        is_active: true
      }
    ];

    it('should get location hierarchy', async () => {
      MockLocation.findAll = jest.fn().mockResolvedValue(mockActiveLocations);

      const response = await request(app)
        .get('/api/v1/locations/hierarchy');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('central_kitchen');
      expect(response.body.data).toHaveProperty('restaurant_branches');
      expect(response.body.data.central_kitchen).toHaveLength(2);
      expect(response.body.data.restaurant_branches).toHaveLength(2);
      
      // Verify only active locations are returned
      expect(MockLocation.findAll).toHaveBeenCalledWith({
        where: { is_active: true },
        include: expect.any(Array),
        order: [['type', 'ASC'], ['name', 'ASC']]
      });
    });
  });
});