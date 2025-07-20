import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum LocationType {
  CENTRAL_KITCHEN = 'central_kitchen',
  RESTAURANT_BRANCH = 'restaurant_branch'
}

interface LocationAttributes {
  id: string;
  name: string;
  type: LocationType;
  address?: string;
  phone?: string;
  manager_id?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface LocationCreationAttributes extends Optional<LocationAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

class Location extends Model<LocationAttributes, LocationCreationAttributes> implements LocationAttributes {
  public id!: string;
  public name!: string;
  public type!: LocationType;
  public address?: string;
  public phone?: string;
  public manager_id?: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Location.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(...Object.values(LocationType)),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    manager_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Location',
    tableName: 'locations',
    timestamps: true,
    underscored: true,
  }
);

export default Location;