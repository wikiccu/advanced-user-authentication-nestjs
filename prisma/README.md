# Database Setup

## Prisma Migrations

To create and apply migrations:

```bash
# Create a new migration
npm run prisma:migrate

# Apply migrations in production
npm run prisma:migrate:deploy

# Reset database (development only)
npm run prisma:migrate:reset
```

## Database Seeding

After running migrations, seed the database with initial roles and permissions:

```bash
npm run prisma:seed
```

This will create:
- **Permissions**: user:create, user:read, user:update, user:delete, role:create, role:read, role:update, role:delete, permission:read
- **Roles**: admin, user, moderator
- **Role-Permission assignments**:
  - `admin`: All permissions
  - `moderator`: User management permissions + read permissions
  - `user`: Basic read permissions

## Prisma Studio

To view and manage your database visually:

```bash
npm run prisma:studio
```

This will open Prisma Studio at `http://localhost:5555`

