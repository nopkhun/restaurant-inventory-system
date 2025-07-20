import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface InventoryAttributes {
  id: string;
  location_id: string;
  ingredient_id: string;
  current_quantity: number;
  reserved_quantity: number;
  last_updated: Date;
}

interface InventoryCreationAttributes extends Optional<InventoryAttributes, 'id' | 'reserved_quantity' | 'last_updated'> {}

class Inventory extends Model<InventoryAttributes, InventoryCreationAttributes> implements InventoryAttributes {
  public id!: string;
  public location_id!: string;
  public ingredient_id!: string;
  public current_quantity!: number;
  public reserved_quantity!: number;
  public last_updated!: Date;
}

Inventory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    location_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    ingredient_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    current_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    reserved_quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    last_updated: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Inventory',
    tableName: 'inventory',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['location_id', 'ingredient_id'],
      },
    ],
  }
);

export default Inventory;