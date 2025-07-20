import sequelize from '../config/database';
import * as migration001 from '../migrations/001-create-users';
import * as migration002 from '../migrations/002-create-user-sessions';
import * as migration003 from '../migrations/003-create-locations';
import * as migration004 from '../migrations/004-create-suppliers';
import * as migration005 from '../migrations/005-create-ingredients';
import * as migration006 from '../migrations/006-create-inventory';
import * as migration007 from '../migrations/007-create-stock-movements';

const migrations = [
  { name: '001-create-users', up: migration001.up, down: migration001.down },
  { name: '002-create-user-sessions', up: migration002.up, down: migration002.down },
  { name: '003-create-locations', up: migration003.up, down: migration003.down },
  { name: '004-create-suppliers', up: migration004.up, down: migration004.down },
  { name: '005-create-ingredients', up: migration005.up, down: migration005.down },
  { name: '006-create-inventory', up: migration006.up, down: migration006.down },
  { name: '007-create-stock-movements', up: migration007.up, down: migration007.down },
];

export const runMigrations = async (): Promise<void> => {
  try {
    console.log('🔄 Starting database migrations...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    const queryInterface = sequelize.getQueryInterface();

    // Create migrations table if it doesn't exist
    await queryInterface.createTable('migrations', {
      name: {
        type: 'VARCHAR(255)',
        primaryKey: true,
      },
      executed_at: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Get executed migrations
    const executedMigrations = await sequelize.query(
      'SELECT name FROM migrations ORDER BY executed_at',
      { type: 'SELECT' }
    ) as Array<{ name: string }>;

    const executedNames = executedMigrations.map(m => m.name);

    // Run pending migrations
    for (const migration of migrations) {
      if (!executedNames.includes(migration.name)) {
        console.log(`🔄 Running migration: ${migration.name}`);
        await migration.up(queryInterface);
        await sequelize.query(
          'INSERT INTO migrations (name) VALUES (?)',
          { replacements: [migration.name] }
        );
        console.log(`✅ Migration completed: ${migration.name}`);
      } else {
        console.log(`⏭️  Migration already executed: ${migration.name}`);
      }
    }

    console.log('✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const rollbackMigrations = async (steps: number = 1): Promise<void> => {
  try {
    console.log(`🔄 Rolling back ${steps} migration(s)...`);
    
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();

    // Get executed migrations in reverse order
    const executedMigrations = await sequelize.query(
      'SELECT name FROM migrations ORDER BY executed_at DESC LIMIT ?',
      { replacements: [steps], type: 'SELECT' }
    ) as Array<{ name: string }>;

    // Rollback migrations
    for (const executed of executedMigrations) {
      const migration = migrations.find(m => m.name === executed.name);
      if (migration) {
        console.log(`🔄 Rolling back migration: ${migration.name}`);
        await migration.down(queryInterface);
        await sequelize.query(
          'DELETE FROM migrations WHERE name = ?',
          { replacements: [migration.name] }
        );
        console.log(`✅ Rollback completed: ${migration.name}`);
      }
    }

    console.log('✅ Rollback completed successfully!');
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
};

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const steps = parseInt(process.argv[3]) || 1;

  if (command === 'up') {
    runMigrations()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else if (command === 'down') {
    rollbackMigrations(steps)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    console.log('Usage: ts-node migrate.ts [up|down] [steps]');
    process.exit(1);
  }
}