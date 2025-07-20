import { Router } from 'express';
import {
  getIngredients,
  getIngredient,
  createIngredient,
  updateIngredient,
  deactivateIngredient,
  reactivateIngredient,
  getIngredientCategories,
  getIngredientUnits,
  bulkImportIngredients,
  exportIngredients
} from '../controllers/ingredient.controller';
import {
  createIngredientSchema,
  updateIngredientSchema,
  getIngredientParamsSchema,
  searchIngredientsQuerySchema,
  bulkImportSchema,
  validate,
  validateParams
} from '../validators/ingredient.validator';
import { authenticate } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Get ingredient categories and units (reference data)
router.get('/categories', getIngredientCategories);
router.get('/units', getIngredientUnits);

// Export ingredients
router.get('/export', exportIngredients);

// Bulk import ingredients
router.post('/bulk-import', validate(bulkImportSchema), bulkImportIngredients);

// CRUD operations
router.get('/', validate(searchIngredientsQuerySchema), getIngredients);
router.get('/:id', validateParams(getIngredientParamsSchema), getIngredient);
router.post('/', validate(createIngredientSchema), createIngredient);
router.put('/:id', validateParams(getIngredientParamsSchema), validate(updateIngredientSchema), updateIngredient);

// Soft delete operations
router.patch('/:id/deactivate', validateParams(getIngredientParamsSchema), deactivateIngredient);
router.patch('/:id/reactivate', validateParams(getIngredientParamsSchema), reactivateIngredient);

export default router;