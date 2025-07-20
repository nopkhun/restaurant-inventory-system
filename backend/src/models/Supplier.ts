import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface SupplierAttributes {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  payment_terms?: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface SupplierCreationAttributes extends Optional<SupplierAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

class Supplier extends Model<SupplierAttributes, SupplierCreationAttributes> implements SupplierAttributes {
  public id!: string;
  public name!: string;
  public contact_person?: string;
  public phone?: string;
  public email?: string;
  public address?: string;
  public payment_terms?: string;
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Supplier.init(
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
    contact_person: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    payment_terms: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Supplier',
    tableName: 'suppliers',
    timestamps: true,
    underscored: true,
  }
);

export default Supplier;