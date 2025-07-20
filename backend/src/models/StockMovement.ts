import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum MovementType {
  STOCK_IN = 'stock_in',
  STOCK_OUT = 'stock_out',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  ADJUSTMENT = 'adjustment'
}

interface StockMovementAttributes {
  id: string;
  location_id: string;
  ingredient_id: string;
  movement_type: MovementType;
  quantity: number;
  unit_cost: number;
  reference_id?: string;
  reference_type?: string;
  reason?: string;
  batch_number?: string;
  expiry_date?: Date;
  created_by: string;
  created_at?: Date;
}

interface StockMovementCreationAttributes extends Optional<StockMovementAttributes, 'id' | 'created_at'> {}

class StockMovement extends Model<StockMovementAttributes, StockMovementCreationAttributes> implements StockMovementAttributes {
  public id!: string;
  public location_id!: string;
  public ingredient_id!: string;
  public movement_type!: MovementType;
  public quantity!: number;
  public unit_cost!: number;
  public reference_id?: string;
  public reference_type?: string;
  public reason?: string;
  public batch_number?: string;
  public expiry_date?: Date;
  public created_by!: string;
  public readonly created_at!: Date;
}

StockMovement.init(
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
    movement_type: {
      type: DataTypes.ENUM(...Object.values(MovementType)),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    unit_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    reference_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    reference_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    batch_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'StockMovement',
    tableName: 'stock_movements',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);

export default StockMovement;