import { Router } from 'express';
import locationController from '../controllers/location.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All location routes require authentication
router.use(authenticate);

// GET /api/v1/locations - Get all locations with optional filtering
router.get('/', locationController.getLocations);

// GET /api/v1/locations/hierarchy - Get location hierarchy
router.get('/hierarchy', locationController.getLocationHierarchy);

// GET /api/v1/locations/:id - Get location by ID
router.get('/:id', locationController.getLocationById);

// POST /api/v1/locations - Create new location
router.post('/', locationController.createLocation);

// PUT /api/v1/locations/:id - Update location
router.put('/:id', locationController.updateLocation);

// DELETE /api/v1/locations/:id - Delete location (soft delete)
router.delete('/:id', locationController.deleteLocation);

export default router;