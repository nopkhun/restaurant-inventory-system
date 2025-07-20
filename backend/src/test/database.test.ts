import sequelize from '../config/database';
import { User, Location, Ingredient, Supplier, Inventory, StockMovement } from '../models';
import { UserRole } from '../models/User';
import { LocationType } from '../models/Location';
import { MovementType } from '../models/StockMovement';


describe('Database Connection and CRUD Operations', () => {
  beforeAll(async () => {
    // Test database connection
    await sequelize.authenticate();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('Database Connection', () => {
    it('should connect to database successfully', async () => {
      expect(sequelize.getDatabaseName()).toBe(process.env.DB_NAME || 'restaurant_inventory');
    });
  });

  describe('User Model CRUD', () => {
    let testUser: User;

    it('should create a user', async () => {
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        first_name: 'Test',
        last_name: 'User',
        role: UserRole.STAFF,
      });

      expect(testUser.id).toBeDefined();
      expect(testUser.username).toBe('testuser');
      expect(testUser.email).toBe('test@example.com');
      expect(testUser.role).toBe(UserRole.STAFF);
    });

    it('should read a user', async () => {
      const foundUser = await User.findByPk(testUser.id);
      expect(foundUser).toBeTruthy();
      expect(foundUser?.username).toBe('testuser');
    });

    it('should update a user', async () => {
      await testUser.update({ first_name: 'Updated' });
      expect(testUser.first_name).toBe('Updated');
    });

    it('should delete a user', async () => {
      await testUser.destroy();
      const deletedUser = await User.findByPk(testUser.id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('Location Model CRUD', () => {
    let testLocation: Location;

    it('should create a location', async () => {
      testLocation = await Location.create({
        name: 'Test Branch',
        type: LocationType.RESTAURANT_BRANCH,
        address: 'Test Address',
        phone: '02-123-4567',
      });

      expect(testLocation.id).toBeDefined();
      expect(testLocation.name).toBe('Test Branch');
      expect(testLocation.type).toBe(LocationType.RESTAURANT_BRANCH);
    });

    it('should read a location', async () => {
      const foundLocation = await Location.findByPk(testLocation.id);
      expect(foundLocation).toBeTruthy();
      expect(foundLocation?.name).toBe('Test Branch');
    });

    it('should update a location', async () => {
      await testLocation.update({ name: 'Updated Branch' });
      expect(testLocation.name).toBe('Updated Branch');
    });

    it('should delete a location', async () => {
      await testLocation.destroy();
      const deletedLocation = await Location.findByPk(testLocation.id);
      expect(deletedLocation).toBeNull();
    });
  });

  describe('Supplier Model CRUD', () => {
    let testSupplier: Supplier;

    it('should create a supplier', async () => {
      testSupplier = await Supplier.create({
        name: 'Test Supplier',
        contact_person: 'John Doe',
        phone: '02-987-6543',
        email: 'supplier@test.com',
      });

      expect(testSupplier.id).toBeDefined();
      expect(testSupplier.name).toBe('Test Supplier');
      expect(testSupplier.contact_person).toBe('John Doe');
    });

    it('should read a supplier', async () => {
      const foundSupplier = await Supplier.findByPk(testSupplier.id);
      expect(foundSupplier).toBeTruthy();
      expect(foundSupplier?.name).toBe('Test Supplier');
    });

    it('should update a supplier', async () => {
      await testSupplier.update({ contact_person: 'Jane Doe' });
      expect(testSupplier.contact_person).toBe('Jane Doe');
    });

    it('should delete a supplier', async () => {
      await testSupplier.destroy();
      const deletedSupplier = await Supplier.findByPk(testSupplier.id);
      expect(deletedSupplier).toBeNull();
    });
  });

  describe('Ingredient Model CRUD', () => {
    let testIngredient: Ingredient;
    let testSupplier: Supplier;

    beforeAll(async () => {
      testSupplier = await Supplier.create({
        name: 'Ingredient Test Supplier',
        contact_person: 'Supplier Contact',
      });
    });

    afterAll(async () => {
      await testSupplier.destroy();
    });

    it('should create an ingredient', async () => {
      testIngredient = await Ingredient.create({
        code: 'TEST001',
        name: 'Test Ingredient',
        category: 'ผัก',
        unit: 'กิโลกรัม',
        cost_per_unit: 10.50,
        supplier_id: testSupplier.id,
        min_stock_level: 5.0,
      });

      expect(testIngredient.id).toBeDefined();
      expect(testIngredient.code).toBe('TEST001');
      expect(testIngredient.name).toBe('Test Ingredient');
      expect(testIngredient.cost_per_unit).toBe(10.50);
    });

    it('should read an ingredient with supplier', async () => {
      const foundIngredient = await Ingredient.findByPk(testIngredient.id, {
        include: [{ model: Supplier, as: 'supplier' }],
      });
      expect(foundIngredient).toBeTruthy();
      expect(foundIngredient?.name).toBe('Test Ingredient');
      expect((foundIngredient as any)?.supplier?.name).toBe('Ingredient Test Supplier');
    });

    it('should update an ingredient', async () => {
      await testIngredient.update({ cost_per_unit: 12.00 });
      expect(testIngredient.cost_per_unit).toBe(12.00);
    });

    it('should delete an ingredient', async () => {
      await testIngredient.destroy();
      const deletedIngredient = await Ingredient.findByPk(testIngredient.id);
      expect(deletedIngredient).toBeNull();
    });
  });

  describe('Inventory and Stock Movement Integration', () => {
    let testLocation: Location;
    let testIngredient: Ingredient;
    let testUser: User;
    let testInventory: Inventory;

    beforeAll(async () => {
      testLocation = await Location.create({
        name: 'Inventory Test Location',
        type: LocationType.CENTRAL_KITCHEN,
      });

      testIngredient = await Ingredient.create({
        code: 'INV001',
        name: 'Inventory Test Ingredient',
        category: 'ผัก',
        unit: 'กิโลกรัม',
        cost_per_unit: 15.00,
        min_stock_level: 10.0,
      });

      testUser = await User.create({
        username: 'inventoryuser',
        email: 'inventory@test.com',
        password_hash: 'hashedpassword',
        first_name: 'Inventory',
        last_name: 'User',
        role: UserRole.STAFF,
        location_id: testLocation.id,
      });
    });

    afterAll(async () => {
      await testUser.destroy();
      await testInventory?.destroy();
      await testIngredient.destroy();
      await testLocation.destroy();
    });

    it('should create inventory record', async () => {
      testInventory = await Inventory.create({
        location_id: testLocation.id,
        ingredient_id: testIngredient.id,
        current_quantity: 50.0,
        reserved_quantity: 5.0,
      });

      expect(testInventory.id).toBeDefined();
      expect(testInventory.current_quantity).toBe(50.0);
      expect(testInventory.reserved_quantity).toBe(5.0);
    });

    it('should create stock movement record', async () => {
      const stockMovement = await StockMovement.create({
        location_id: testLocation.id,
        ingredient_id: testIngredient.id,
        movement_type: MovementType.STOCK_IN,
        quantity: 50.0,
        unit_cost: 15.00,
        reason: 'Initial stock',
        created_by: testUser.id,
      });

      expect(stockMovement.id).toBeDefined();
      expect(stockMovement.movement_type).toBe(MovementType.STOCK_IN);
      expect(stockMovement.quantity).toBe(50.0);

      await stockMovement.destroy();
    });

    it('should read inventory with associations', async () => {
      const foundInventory = await Inventory.findByPk(testInventory.id, {
        include: [
          { model: Location, as: 'location' },
          { model: Ingredient, as: 'ingredient' },
        ],
      });

      expect(foundInventory).toBeTruthy();
      expect((foundInventory as any)?.location?.name).toBe('Inventory Test Location');
      expect((foundInventory as any)?.ingredient?.name).toBe('Inventory Test Ingredient');
    });

    it('should enforce unique constraint on location-ingredient pair', async () => {
      await expect(
        Inventory.create({
          location_id: testLocation.id,
          ingredient_id: testIngredient.id,
          current_quantity: 25.0,
        })
      ).rejects.toThrow();
    });
  });

  describe('Model Validations', () => {
    it('should validate email format in User model', async () => {
      await expect(
        User.create({
          username: 'invaliduser',
          email: 'invalid-email',
          password_hash: 'hashedpassword',
          first_name: 'Invalid',
          last_name: 'User',
          role: UserRole.STAFF,
        })
      ).rejects.toThrow();
    });

    it('should validate unique username in User model', async () => {
      const user1 = await User.create({
        username: 'uniqueuser',
        email: 'unique1@test.com',
        password_hash: 'hashedpassword',
        first_name: 'Unique',
        last_name: 'User1',
        role: UserRole.STAFF,
      });

      await expect(
        User.create({
          username: 'uniqueuser',
          email: 'unique2@test.com',
          password_hash: 'hashedpassword',
          first_name: 'Unique',
          last_name: 'User2',
          role: UserRole.STAFF,
        })
      ).rejects.toThrow();

      await user1.destroy();
    });

    it('should validate unique ingredient code', async () => {
      const ingredient1 = await Ingredient.create({
        code: 'UNIQUE001',
        name: 'Unique Ingredient 1',
        category: 'ผัก',
        unit: 'กิโลกรัม',
        cost_per_unit: 10.00,
        min_stock_level: 5.0,
      });

      await expect(
        Ingredient.create({
          code: 'UNIQUE001',
          name: 'Unique Ingredient 2',
          category: 'ผัก',
          unit: 'กิโลกรัม',
          cost_per_unit: 15.00,
          min_stock_level: 5.0,
        })
      ).rejects.toThrow();

      await ingredient1.destroy();
    });
  });
});