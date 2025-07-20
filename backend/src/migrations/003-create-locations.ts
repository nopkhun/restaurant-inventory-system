import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.createTable('locations', {
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
      type: DataTypes.ENUM('central_kitchen', 'restaurant_branch'),
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
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  // Add indexes
  await queryInterface.addIndex('locations', ['type']);
  await queryInterface.addIndex('locations', ['manager_id']);
  await queryInterface.addIndex('locations', ['is_active']);

  // Add foreign key constraint for users.location_id
  await queryInterface.addConstraint('users', {
    fields: ['location_id'],
    type: 'foreign key',
    name: 'fk_users_location_id',
    references: {
      table: 'locations',
      field: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.removeConstraint('users', 'fk_users_location_id');
  await queryInterface.dropTable('locations');
};