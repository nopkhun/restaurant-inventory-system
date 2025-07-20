# Database Setup Documentation

## Overview

This document describes the complete database schema and migration setup for the Restaurant Inventory Management System. The database is designed using MySQL with Sequelize ORM and follows the design specifications from the requirements document.

## Database Schema

### Core Tables

1. **users** - User management with role-based access control
2. **user_sessions** - JWT refresh token management
3. **locations** - Central kitchen and restaurant branches
4. **suppliers** - Vendor management
5. **ingredients** - Master ingredient data with categories
6. **inventory** - Current stock levels per location
7. **stock_movements** - All inventory transactions and movements

### Key Features

- **UUID Primary Keys** - All tables use UUID for better security and scalability
- **Soft Deletes** - Using `is_active` flags instead of hard deletes
- **Audit Trail** - All movements tracked with user and timestamp
- **Foreign Key Constraints** - Proper referential integrity
- **Unique Constraints** - Prevent duplicate data (usernames, ingredient codes, etc.)
- **Indexes** - Optimized for common query patterns

## Models and Relationships

### User Management
```
User ←→ Location (users belong to locations)
Location ←→ User (locations have managers)
UserSession ←→ User (refresh token management)
```

### Inventory Management
```
Ingredient ←→ Supplier (ingredients have suppliers)
Inventory ←→ Location + Ingredient (stock per location)
StockMovement ←→ Location + Ingredient + User (transaction tracking)
```

## Migration System

### Migration Files
- `001-create-users.ts` - User and authentication tables
- `002-create-user-sessions.ts` - JWT session management
- `003-create-locations.ts` - Location hierarchy
- `004-create-suppliers.ts` - Supplier management
- `005-create-ingredients.ts` - Ingredient master data
- `006-create-inventory.ts` - Current stock tracking
- `007-create-stock-movements.ts` - Transaction history

### Migration Features
- **Versioned Migrations** - Sequential execution with rollback support
- **Migration Tracking** - Built-in migration history table
- **Foreign Key Management** - Proper constraint creation and removal
- **Index Creation** - Performance optimization

## Seeder System

### Initial Data
- **Locations** - Sample central kitchen and branches with Thai addresses
- **Suppliers** - Sample suppliers with Thai company information

### Seeder Features
- **Idempotent** - Safe to run multiple times
- **Rollback Support** - Can undo seeded data
- **Tracking** - Built-in seeder history table

## Environment Configuration

### Database Settings
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=restaurant_inventory
DB_USER=root
DB_PASSWORD=password
```

### Test Environment
- Separate test database configuration
- Isolated test environment settings
- Test-specific connection parameters

## Available Commands

### Migration Commands
```bash
npm run db:migrate              # Run all pending migrations
npm run db:migrate:rollback     # Rollback last migration
```

### Seeder Commands
```bash
npm run db:seed                 # Run all pending seeders
npm run db:seed:rollback        # Rollback last seeder
```

### Combined Commands
```bash
npm run db:setup                # Run migrations + seeders
npm run db:demo                 # Show database setup information
```

## Model Validation

### Built-in Validations
- **Email Format** - Proper email validation for users and suppliers
- **Unique Constraints** - Username, email, ingredient codes
- **Required Fields** - Essential data validation
- **Enum Values** - Role and type validations

### Business Rules
- **Stock Levels** - Non-negative quantities
- **Movement Types** - Proper transaction categorization
- **Location Types** - Central kitchen vs restaurant branch
- **User Roles** - Hierarchical permission system

## Testing

### Test Coverage
- **Model Definitions** - Verify all attributes and relationships
- **Configuration** - Database connection and settings
- **Associations** - Model relationships and foreign keys
- **Validations** - Data integrity and business rules

### Test Environment
- Separate test database configuration
- Isolated test data
- Automated test cleanup

## Performance Considerations

### Indexing Strategy
- Primary keys (UUID)
- Foreign key relationships
- Common query fields (username, email, ingredient codes)
- Date-based queries (created_at, updated_at)
- Status fields (is_active, movement_type)

### Query Optimization
- Proper join strategies
- Efficient relationship loading
- Connection pooling
- Query result caching (where appropriate)

## Security Features

### Data Protection
- Password hashing (bcrypt)
- JWT token management
- SQL injection prevention (parameterized queries)
- Input validation and sanitization

### Access Control
- Role-based permissions
- Location-based data access
- User session management
- Audit trail for all changes

## Requirements Compliance

This database setup addresses the following requirements:

- **2.1** - Ingredient master data management
- **3.1** - Location and branch management
- **4.1** - Stock movement tracking
- **5.1** - Inventory audit capabilities
- **6.1** - Recipe and cost management foundation
- **7.1** - Supplier management

## Next Steps

1. **Database Creation** - Create MySQL database instance
2. **Environment Setup** - Configure connection parameters
3. **Migration Execution** - Run `npm run db:setup`
4. **API Development** - Build REST endpoints using these models
5. **Authentication** - Implement JWT-based authentication
6. **Business Logic** - Add inventory management services

## Troubleshooting

### Common Issues
1. **Connection Refused** - Check MySQL service and credentials
2. **Migration Errors** - Verify database permissions and schema
3. **Foreign Key Constraints** - Ensure proper migration order
4. **Duplicate Keys** - Check for existing data conflicts

### Solutions
- Verify MySQL installation and service status
- Check environment variables and configuration
- Review migration logs for specific errors
- Use rollback commands to reset problematic migrations

## Conclusion

The database schema is now fully implemented with:
- ✅ Complete table structure based on design document
- ✅ Proper relationships and constraints
- ✅ Migration and seeding system
- ✅ Model validations and business rules
- ✅ Test coverage for configuration and models
- ✅ Performance optimizations and security features

The system is ready for API development and can be deployed to any MySQL-compatible environment.