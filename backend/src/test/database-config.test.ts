import sequelize from '../config/database';
import { User, Location, Ingredient, Supplier, Inventory, StockMovement } from '../models';
import { UserRole } from '../models/User';
import { LocationType } from '../models/Location';
import { MovementType } from '../models/StockMovement';

describe('Database Configuration and Models', () => {
  describe('Database Configuration', () => {
    it('should have correct database configuration', () => {
      expect(sequelize.getDatabaseName()).toBe(process.env.DB_NAME || 'restaurant_inventory_test');
      expect(sequelize.config.host).toBe(process.env.DB_HOST || 'localhost');
      expect(sequelize.config.port).toBe(parseInt(process.env.DB_PORT || '3306'));
    });

    it('should have correct dialect', () => {
      expect(sequelize.getDialect()).toBe('mysql');
    });
  });

  describe('Model Definitions', () => {
    it('should have User model with correct attributes', () => {
      const userAttributes = User.getTableName();
      expect(userAttributes).toBe('users');
      
      const userModel = User.rawAttributes;
      expect(userModel.id).toBeDefined();
      expect(userModel.username).toBeDefined();
      expect(userModel.email).toBeDefined();
      expect(userModel.password_hash).toBeDefined();
      expect(userModel.role).toBeDefined();
    });

    it('should have Location model with correct attributes', () => {
      const locationAttributes = Location.getTableName();
      expect(locationAttributes).toBe('locations');
      
      const locationModel = Location.rawAttributes;
      expect(locationModel.id).toBeDefined();
      expect(locationModel.name).toBeDefined();
      expect(locationModel.type).toBeDefined();
    });

    it('should have Ingredient model with correct attributes', () => {
      const ingredientAttributes = Ingredient.getTableName();
      expect(ingredientAttributes).toBe('ingredients');
      
      const ingredientModel = Ingredient.rawAttributes;
      expect(ingredientModel.id).toBeDefined();
      expect(ingredientModel.code).toBeDefined();
      expect(ingredientModel.name).toBeDefined();
      expect(ingredientModel.category).toBeDefined();
      expect(ingredientModel.unit).toBeDefined();
      expect(ingredientModel.cost_per_unit).toBeDefined();
    });

    it('should have Supplier model with correct attributes', () => {
      const supplierAttributes = Supplier.getTableName();
      expect(supplierAttributes).toBe('suppliers');
      
      const supplierModel = Supplier.rawAttributes;
      expect(supplierModel.id).toBeDefined();
      expect(supplierModel.name).toBeDefined();
    });

    it('should have Inventory model with correct attributes', () => {
      const inventoryAttributes = Inventory.getTableName();
      expect(inventoryAttributes).toBe('inventory');
      
      const inventoryModel = Inventory.rawAttributes;
      expect(inventoryModel.id).toBeDefined();
      expect(inventoryModel.location_id).toBeDefined();
      expect(inventoryModel.ingredient_id).toBeDefined();
      expect(inventoryModel.current_quantity).toBeDefined();
      expect(inventoryModel.reserved_quantity).toBeDefined();
    });

    it('should have StockMovement model with correct attributes', () => {
      const stockMovementAttributes = StockMovement.getTableName();
      expect(stockMovementAttributes).toBe('stock_movements');
      
      const stockMovementModel = StockMovement.rawAttributes;
      expect(stockMovementModel.id).toBeDefined();
      expect(stockMovementModel.location_id).toBeDefined();
      expect(stockMovementModel.ingredient_id).toBeDefined();
      expect(stockMovementModel.movement_type).toBeDefined();
      expect(stockMovementModel.quantity).toBeDefined();
      expect(stockMovementModel.created_by).toBeDefined();
    });
  });

  describe('Enum Values', () => {
    it('should have correct UserRole enum values', () => {
      expect(UserRole.ADMIN).toBe('admin');
      expect(UserRole.AREA_MANAGER).toBe('area_manager');
      expect(UserRole.CENTRAL_KITCHEN_MANAGER).toBe('central_kitchen_manager');
      expect(UserRole.RESTAURANT_MANAGER).toBe('restaurant_manager');
      expect(UserRole.HEAD_CHEF).toBe('head_chef');
      expect(UserRole.STAFF).toBe('staff');
    });

    it('should have correct LocationType enum values', () => {
      expect(LocationType.CENTRAL_KITCHEN).toBe('central_kitchen');
      expect(LocationType.RESTAURANT_BRANCH).toBe('restaurant_branch');
    });

    it('should have correct MovementType enum values', () => {
      expect(MovementType.STOCK_IN).toBe('stock_in');
      expect(MovementType.STOCK_OUT).toBe('stock_out');
      expect(MovementType.TRANSFER_IN).toBe('transfer_in');
      expect(MovementType.TRANSFER_OUT).toBe('transfer_out');
      expect(MovementType.ADJUSTMENT).toBe('adjustment');
    });
  });

  describe('Model Associations', () => {
    it('should have User-Location associations', () => {
      const userAssociations = User.associations;
      expect(userAssociations.location).toBeDefined();
    });

    it('should have Location-User associations', () => {
      const locationAssociations = Location.associations;
      expect(locationAssociations.users).toBeDefined();
      expect(locationAssociations.manager).toBeDefined();
    });

    it('should have Ingredient-Supplier associations', () => {
      const ingredientAssociations = Ingredient.associations;
      expect(ingredientAssociations.supplier).toBeDefined();
    });

    it('should have Inventory associations', () => {
      const inventoryAssociations = Inventory.associations;
      expect(inventoryAssociations.location).toBeDefined();
      expect(inventoryAssociations.ingredient).toBeDefined();
    });

    it('should have StockMovement associations', () => {
      const stockMovementAssociations = StockMovement.associations;
      expect(stockMovementAssociations.location).toBeDefined();
      expect(stockMovementAssociations.ingredient).toBeDefined();
      expect(stockMovementAssociations.creator).toBeDefined();
    });
  });
});