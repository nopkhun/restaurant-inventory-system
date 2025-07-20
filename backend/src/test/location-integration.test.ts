import { LocationController } from '../controllers/location.controller';
import Location, { LocationType } from '../models/Location';
import User, { UserRole } from '../models/User';

// Mock the models
jest.mock('../models/Location');
jest.mock('../models/User');

const MockLocation = Location as jest.Mocked<typeof Location>;
const MockUser = User as jest.Mocked<typeof User>;

describe('Location Management Integration', () => {
  let locationController: LocationController;
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    locationController = new LocationController();
    mockReq = {
      body: {},
      params: {},
      query: {},
      user: { id: 'test-user-id', role: UserRole.ADMIN }
    };
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('Location CRUD Operations', () => {
    it('should support central kitchen and restaurant branch types', async () => {
      const centralKitchenData = {
        name: 'Main Central Kitchen',
        type: LocationType.CENTRAL_KITCHEN,
        address: '123 Kitchen Street'
      };

      const restaurantBranchData = {
        name: 'Branch Restaurant',
        type: LocationType.RESTAURANT_BRANCH,
        address: '456 Branch Street'
      };

      MockLocation.create = jest.fn()
        .mockResolvedValueOnce({ id: 'ck-1', ...centralKitchenData })
        .mockResolvedValueOnce({ id: 'rb-1', ...restaurantBranchData });

      MockLocation.findByPk = jest.fn()
        .mockResolvedValueOnce({ id: 'ck-1', ...centralKitchenData })
        .mockResolvedValueOnce({ id: 'rb-1', ...restaurantBranchData });

      // Test central kitchen creation
      mockReq.body = centralKitchenData;
      await locationController.createLocation(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);

      // Test restaurant branch creation
      mockReq.body = restaurantBranchData;
      await locationController.createLocation(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(201);

      expect(MockLocation.create).toHaveBeenCalledTimes(2);
    });

    it('should support location hierarchy and relationships', async () => {
      const mockLocations = [
        { id: 'ck-1', name: 'Central Kitchen', type: LocationType.CENTRAL_KITCHEN, is_active: true },
        { id: 'rb-1', name: 'Branch 1', type: LocationType.RESTAURANT_BRANCH, is_active: true },
        { id: 'rb-2', name: 'Branch 2', type: LocationType.RESTAURANT_BRANCH, is_active: true }
      ];

      MockLocation.findAll = jest.fn().mockResolvedValue(mockLocations);

      await locationController.getLocationHierarchy(mockReq, mockRes);

      expect(MockLocation.findAll).toHaveBeenCalledWith({
        where: { is_active: true },
        include: expect.any(Array),
        order: [['type', 'ASC'], ['name', 'ASC']]
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          central_kitchen: [mockLocations[0]],
          restaurant_branches: [mockLocations[1], mockLocations[2]]
        }
      });
    });

    it('should support filtering and searching', async () => {
      const mockLocations = [
        { id: 'ck-1', name: 'Central Kitchen', type: LocationType.CENTRAL_KITCHEN, is_active: true }
      ];

      MockLocation.findAll = jest.fn().mockResolvedValue(mockLocations);

      // Test type filtering
      mockReq.query = { type: 'central_kitchen' };
      await locationController.getLocations(mockReq, mockRes);

      expect(MockLocation.findAll).toHaveBeenCalledWith({
        where: { type: 'central_kitchen' },
        include: expect.any(Array),
        order: [['name', 'ASC']]
      });

      // Test search functionality
      jest.clearAllMocks();
      mockReq.query = { search: 'Kitchen' };
      await locationController.getLocations(mockReq, mockRes);

      // Just verify that findAll was called with search parameters
      expect(MockLocation.findAll).toHaveBeenCalled();
      const callArgs = MockLocation.findAll.mock.calls[0]?.[0];
      expect(callArgs?.where).toBeDefined();
      expect(callArgs?.include).toBeDefined();
      expect(callArgs?.order).toEqual([['name', 'ASC']]);
    });

    it('should validate manager relationships', async () => {
      const locationData = {
        name: 'Test Location',
        type: LocationType.RESTAURANT_BRANCH,
        manager_id: 'manager-123'
      };

      // Test with valid manager
      MockUser.findByPk = jest.fn().mockResolvedValue({ id: 'manager-123', name: 'Test Manager' });
      MockLocation.create = jest.fn().mockResolvedValue({ id: 'loc-1', ...locationData });
      MockLocation.findByPk = jest.fn().mockResolvedValue({ id: 'loc-1', ...locationData });

      mockReq.body = locationData;
      await locationController.createLocation(mockReq, mockRes);

      expect(MockUser.findByPk).toHaveBeenCalledWith('manager-123');
      expect(mockRes.status).toHaveBeenCalledWith(201);

      // Test with invalid manager
      MockUser.findByPk = jest.fn().mockResolvedValue(null);
      
      await locationController.createLocation(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe('Location Management Features', () => {
    it('should support soft delete functionality', async () => {
      const mockLocation = {
        id: 'loc-1',
        name: 'Test Location',
        is_active: true,
        update: jest.fn().mockResolvedValue({ is_active: false })
      };

      MockLocation.findByPk = jest.fn().mockResolvedValue(mockLocation);

      mockReq.params = { id: 'loc-1' };
      await locationController.deleteLocation(mockReq, mockRes);

      expect(mockLocation.update).toHaveBeenCalledWith({ is_active: false });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'ลบสาขาเรียบร้อยแล้ว'
      });
    });

    it('should support location updates', async () => {
      const mockLocation = {
        id: 'loc-1',
        name: 'Original Name',
        type: LocationType.RESTAURANT_BRANCH,
        address: 'Original Address',
        is_active: true,
        update: jest.fn()
      };

      const updateData = {
        name: 'Updated Name',
        address: 'Updated Address',
        phone: '02-123-4567'
      };

      MockLocation.findByPk = jest.fn()
        .mockResolvedValueOnce(mockLocation)
        .mockResolvedValueOnce({ ...mockLocation, ...updateData });

      mockLocation.update.mockResolvedValue({ ...mockLocation, ...updateData });

      mockReq.params = { id: 'loc-1' };
      mockReq.body = updateData;

      await locationController.updateLocation(mockReq, mockRes);

      expect(mockLocation.update).toHaveBeenCalledWith({
        name: updateData.name,
        type: mockLocation.type,
        address: updateData.address,
        phone: updateData.phone,
        manager_id: undefined,
        is_active: mockLocation.is_active
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining(updateData),
        message: 'อัปเดตข้อมูลสาขาเรียบร้อยแล้ว'
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors properly', async () => {
      // Test missing required fields
      mockReq.body = {};
      await locationController.createLocation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ข้อมูลไม่ครบถ้วน',
          details: expect.any(Array)
        }
      });

      // Test invalid location type
      mockReq.body = { name: 'Test', type: 'invalid_type' };
      await locationController.createLocation(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'ประเภทสาขาไม่ถูกต้อง'
        }
      });
    });

    it('should handle not found errors', async () => {
      MockLocation.findByPk = jest.fn().mockResolvedValue(null);

      mockReq.params = { id: 'non-existent-id' };
      await locationController.getLocationById(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'LOCATION_NOT_FOUND',
          message: 'ไม่พบข้อมูลสาขาที่ระบุ'
        }
      });
    });
  });
});