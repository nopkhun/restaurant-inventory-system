import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// Predefined categories for ingredients
export const INGREDIENT_CATEGORIES = [
  'เนื้อสัตว์', // Meat
  'ผัก', // Vegetables
  'ผลไม้', // Fruits
  'เครื่องปรุง', // Seasonings
  'เครื่องเทศ', // Spices
  'น้ำมัน', // Oils
  'แป้ง', // Flour
  'นม/ไข่', // Dairy/Eggs
  'อาหารทะเล', // Seafood
  'เครื่องดื่ม', // Beverages
  'อื่นๆ' // Others
] as const;

// Predefined units for ingredients
export const INGREDIENT_UNITS = [
  'กิโลกรัม', // Kilogram
  'กรัม', // Gram
  'ลิตร', // Liter
  'มิลลิลิตร', // Milliliter
  'ชิ้น', // Piece
  'ใบ', // Leaf
  'หัว', // Head
  'ฟอง', // Bubble/Egg
  'แผ่น', // Sheet
  'ขวด', // Bottle
  'กล่อง', // Box
  'ถุง' // Bag
] as const;

export type IngredientCategory = typeof INGREDIENT_CATEGORIES[number];
export type IngredientUnit = typeof INGREDIENT_UNITS[number];

interface IngredientAttributes {
  id: string;
  code: string;
  name: string;
  category: IngredientCategory;
  unit: IngredientUnit;
  cost_per_unit: number;
  supplier_id?: string;
  min_stock_level: number;
  shelf_life_days?: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface IngredientCreationAttributes extends Optional<IngredientAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

class Ingredient extends Model<IngredientAttributes, IngredientCreationAttributes> implements IngredientAttributes {
  public id!: string;
  public code!: string;
  public name!: string;
  public category!: IngredientCategory;
  public unit!: IngredientUnit;
  public cost_per_unit!: number;
  public supplier_id?: string;
  public min_stock_level!: number;
  public shelf_life_days?: number;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Ingredient.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    cost_per_unit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    supplier_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    min_stock_level: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    shelf_life_days: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Ingredient',
    tableName: 'ingredients',
    timestamps: true,
    underscored: true,
  }
);

export default Ingredient;