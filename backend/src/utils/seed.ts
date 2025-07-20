import sequelize from '../config/database';
import * as seeder001 from '../seeders/001-initial-locations';
import * as seeder002 from '../seeders/002-initial-suppliers';

const seeders = [
  { name: '001-initial-locations', up: seeder001.up, down: seeder001.down },
  { name: '002-initial-suppliers', up: seeder002.up, down: seeder002.down },
];

export const runSeeders = async (): Promise<void> => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    const queryInterface = sequelize.getQueryInterface();

    // Create seeders table if it doesn't exist
    await queryInterface.createTable('seeders', {
      name: {
        type: 'VARCHAR(255)',
        primaryKey: true,
      },
      executed_at: {
        type: 'TIMESTAMP',
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Get executed seeders
    const executedSeeders = await sequelize.query(
      'SELECT name FROM seeders ORDER BY executed_at',
      { type: 'SELECT' }
    ) as Array<{ name: string }>;

    const executedNames = executedSeeders.map(s => s.name);

    // Run pending seeders
    for (const seeder of seeders) {
      if (!executedNames.includes(seeder.name)) {
        console.log(`🌱 Running seeder: ${seeder.name}`);
        await seeder.up(queryInterface);
        await sequelize.query(
          'INSERT INTO seeders (name) VALUES (?)',
          { replacements: [seeder.name] }
        );
        console.log(`✅ Seeder completed: ${seeder.name}`);
      } else {
        console.log(`⏭️  Seeder already executed: ${seeder.name}`);
      }
    }

    console.log('✅ All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};

export const rollbackSeeders = async (steps: number = 1): Promise<void> => {
  try {
    console.log(`🔄 Rolling back ${steps} seeder(s)...`);
    
    await sequelize.authenticate();
    const queryInterface = sequelize.getQueryInterface();

    // Get executed seeders in reverse order
    const executedSeeders = await sequelize.query(
      'SELECT name FROM seeders ORDER BY executed_at DESC LIMIT ?',
      { replacements: [steps], type: 'SELECT' }
    ) as Array<{ name: string }>;

    // Rollback seeders
    for (const executed of executedSeeders) {
      const seeder = seeders.find(s => s.name === executed.name);
      if (seeder) {
        console.log(`🔄 Rolling back seeder: ${seeder.name}`);
        await seeder.down(queryInterface);
        await sequelize.query(
          'DELETE FROM seeders WHERE name = ?',
          { replacements: [seeder.name] }
        );
        console.log(`✅ Rollback completed: ${seeder.name}`);
      }
    }

    console.log('✅ Seeder rollback completed successfully!');
  } catch (error) {
    console.error('❌ Seeder rollback failed:', error);
    throw error;
  }
};

// CLI interface
if (require.main === module) {
  const command = process.argv[2];
  const steps = parseInt(process.argv[3]) || 1;

  if (command === 'up') {
    runSeeders()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else if (command === 'down') {
    rollbackSeeders(steps)
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  } else {
    console.log('Usage: ts-node seed.ts [up|down] [steps]');
    process.exit(1);
  }
}