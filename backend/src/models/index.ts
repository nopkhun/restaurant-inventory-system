import sequelize from '../config/database';
import User from './User';
import UserSession from './UserSession';
import Location from './Location';
import Ingredient from './Ingredient';
import Inventory from './Inventory';
import StockMovement from './StockMovement';
import Supplier from './Supplier';

// Define associations
User.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });
Location.hasMany(User, { foreignKey: 'location_id', as: 'users' });

Location.belongsTo(User, { foreignKey: 'manager_id', as: 'manager' });

UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });

Ingredient.belongsTo(Supplier, { foreignKey: 'supplier_id', as: 'supplier' });
Supplier.hasMany(Ingredient, { foreignKey: 'supplier_id', as: 'ingredients' });

Inventory.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });
Inventory.belongsTo(Ingredient, { foreignKey: 'ingredient_id', as: 'ingredient' });
Location.hasMany(Inventory, { foreignKey: 'location_id', as: 'inventory' });
Ingredient.hasMany(Inventory, { foreignKey: 'ingredient_id', as: 'inventory' });

StockMovement.belongsTo(Location, { foreignKey: 'location_id', as: 'location' });
StockMovement.belongsTo(Ingredient, { foreignKey: 'ingredient_id', as: 'ingredient' });
StockMovement.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Location.hasMany(StockMovement, { foreignKey: 'location_id', as: 'stockMovements' });
Ingredient.hasMany(StockMovement, { foreignKey: 'ingredient_id', as: 'stockMovements' });
User.hasMany(StockMovement, { foreignKey: 'created_by', as: 'stockMovements' });

export {
  sequelize,
  User,
  UserSession,
  Location,
  Ingredient,
  Inventory,
  StockMovement,
  Supplier,
};

export default {
  sequelize,
  User,
  UserSession,
  Location,
  Ingredient,
  Inventory,
  StockMovement,
  Supplier,
};