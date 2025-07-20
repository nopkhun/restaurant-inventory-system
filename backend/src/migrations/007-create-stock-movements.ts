import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable('stock_movements', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    location_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'locations',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    ingredient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'ingredients',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    movement_type: {
      type: DataTypes.ENUM('stock_in', 'stock_out', 'transfer_in', 'transfer_out', 'adjustment'),
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
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Add indexes
  await queryInterface.addIndex('stock_movements', ['location_id']);
  await queryInterface.addIndex('stock_movements', ['ingredient_id']);
  await queryInterface.addIndex('stock_movements', ['movement_type']);
  await queryInterface.addIndex('stock_movements', ['created_by']);
  await queryInterface.addIndex('stock_movements', ['created_at']);
  await queryInterface.addIndex('stock_movements', ['reference_id', 'reference_type']);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('stock_movements');
};