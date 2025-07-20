import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable('inventory', {
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
  });

  // Add unique constraint and indexes
  await queryInterface.addConstraint('inventory', {
    fields: ['location_id', 'ingredient_id'],
    type: 'unique',
    name: 'unique_location_ingredient',
  });
  
  await queryInterface.addIndex('inventory', ['location_id']);
  await queryInterface.addIndex('inventory', ['ingredient_id']);
  await queryInterface.addIndex('inventory', ['current_quantity']);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.dropTable('inventory');
};