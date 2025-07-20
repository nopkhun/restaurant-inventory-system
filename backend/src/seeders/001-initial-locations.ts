import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  const centralKitchenId = uuidv4();
  const branch1Id = uuidv4();
  const branch2Id = uuidv4();

  await queryInterface.bulkInsert('locations', [
    {
      id: centralKitchenId,
      name: 'ครัวกลาง',
      type: 'central_kitchen',
      address: '123 ถนนสุขุมวิท แขวงคลองตัน เขตคลองตัน กรุงเทพฯ 10110',
      phone: '02-123-4567',
      manager_id: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: branch1Id,
      name: 'สาขาสยาม',
      type: 'restaurant_branch',
      address: '456 ถนนพระราม 1 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330',
      phone: '02-234-5678',
      manager_id: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: branch2Id,
      name: 'สาขาอโศก',
      type: 'restaurant_branch',
      address: '789 ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพฯ 10110',
      phone: '02-345-6789',
      manager_id: null,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('✅ Initial locations seeded successfully');
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.bulkDelete('locations', {}, {});
};