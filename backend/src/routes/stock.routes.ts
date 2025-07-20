import express from 'express';
import { 
  getStockMovements,
  createMovement
} from '../controllers/stock.controller';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Stock movement routes
router.route('/')
  .get(asyncHandler(getStockMovements))
  .post(asyncHandler(createMovement));

export default router;
