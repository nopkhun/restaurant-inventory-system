import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.bulkInsert('suppliers', [
    {
      id: uuidv4(),
      name: 'บริษัท เนื้อสดใหม่ จำกัด',
      contact_person: 'คุณสมชาย ใจดี',
      phone: '02-111-2222',
      email: 'contact@freshmeats.co.th',
      address: '100 ถนนเพชรบุรี แขวงราชเทวี เขตราชเทวี กรุงเทพฯ 10400',
      payment_terms: 'เครดิต 30 วัน',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      name: 'ตลาดผักสด',
      contact_person: 'คุณสมหญิง สดใส',
      phone: '02-333-4444',
      email: 'info@freshveggies.com',
      address: '200 ถนนลาดพร้าว แขวงจตุจักร เขตจตุจักร กรุงเทพฯ 10900',
      payment_terms: 'เงินสด',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: uuidv4(),
      name: 'บริษัท เครื่องปรุงรส จำกัด',
      contact_person: 'คุณสมศักดิ์ รสชาติ',
      phone: '02-555-6666',
      email: 'sales@seasonings.co.th',
      address: '300 ถนนรัชดาภิเษก แขวงห้วยขวาง เขตห้วยขวาง กรุงเทพฯ 10310',
      payment_terms: 'เครดิต 15 วัน',
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ]);

  console.log('✅ Initial suppliers seeded successfully');
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.bulkDelete('suppliers', {}, {});
};