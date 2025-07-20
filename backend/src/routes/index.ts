import express from 'express';
import stockRoutes from './stock.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import locationRoutes from './location.routes';
import ingredientRoutes from './ingredient.routes';

const router = express.Router();

// API Documentation endpoint
router.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'Restaurant Inventory Management API',
    version: process.env.API_VERSION || 'v1',
    endpoints: {
      health: '/health',
      auth: {
        login: 'POST /auth/login',
        register: 'POST /auth/register',
        refresh: 'POST /auth/refresh',
        logout: 'POST /auth/logout'
      },
      users: {
        list: 'GET /users',
        create: 'POST /users',
        update: 'PUT /users/:id',
        delete: 'DELETE /users/:id'
      },
      locations: {
        list: 'GET /locations',
        create: 'POST /locations',
        update: 'PUT /locations/:id',
        delete: 'DELETE /locations/:id'
      },
      ingredients: {
        list: 'GET /ingredients',
        create: 'POST /ingredients',
        update: 'PUT /ingredients/:id',
        delete: 'DELETE /ingredients/:id',
        bulkImport: 'POST /ingredients/bulk-import'
      },
      inventory: {
        getByLocation: 'GET /inventory/:locationId',
        stockIn: 'POST /inventory/stock-in',
        stockOut: 'POST /inventory/stock-out',
        transfer: 'POST /inventory/transfer',
        adjustment: 'POST /inventory/adjustment'
      },
      recipes: {
        list: 'GET /recipes',
        create: 'POST /recipes',
        update: 'PUT /recipes/:id',
        delete: 'DELETE /recipes/:id'
      },
      suppliers: {
        list: 'GET /suppliers',
        create: 'POST /suppliers',
        update: 'PUT /suppliers/:id',
        delete: 'DELETE /suppliers/:id'
      },
      purchaseOrders: {
        list: 'GET /purchase-orders',
        create: 'POST /purchase-orders',
        update: 'PUT /purchase-orders/:id',
        updateStatus: 'PATCH /purchase-orders/:id/status'
      },
      reports: {
        inventorySummary: 'GET /reports/inventory-summary',
        stockMovement: 'GET /reports/stock-movement',
        costAnalysis: 'GET /reports/cost-analysis',
        variance: 'GET /reports/variance'
      }
    },
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/stock', stockRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/locations', locationRoutes);
router.use('/ingredients', ingredientRoutes);

router.use('/inventory', (_req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Inventory management endpoints will be implemented in tasks 10-12'
    }
  });
});

router.use('/recipes', (_req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Recipe management endpoints will be implemented in task 15'
    }
  });
});

router.use('/suppliers', (_req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Supplier management endpoints will be implemented in task 17'
    }
  });
});

router.use('/purchase-orders', (_req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Purchase order endpoints will be implemented in task 18'
    }
  });
});

router.use('/reports', (_req, res) => {
  res.status(501).json({
    success: false,
    error: {
      code: 'NOT_IMPLEMENTED',
      message: 'Reporting endpoints will be implemented in tasks 19-20'
    }
  });
});

export default router;