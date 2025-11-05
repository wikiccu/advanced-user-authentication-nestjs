import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create Permissions
  console.log('Creating permissions...');
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'user:create' },
      update: {},
      create: {
        name: 'user:create',
        description: 'Create users',
        resource: 'user',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'user:read' },
      update: {},
      create: {
        name: 'user:read',
        description: 'Read users',
        resource: 'user',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'user:update' },
      update: {},
      create: {
        name: 'user:update',
        description: 'Update users',
        resource: 'user',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'user:delete' },
      update: {},
      create: {
        name: 'user:delete',
        description: 'Delete users',
        resource: 'user',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'role:create' },
      update: {},
      create: {
        name: 'role:create',
        description: 'Create roles',
        resource: 'role',
        action: 'create',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'role:read' },
      update: {},
      create: {
        name: 'role:read',
        description: 'Read roles',
        resource: 'role',
        action: 'read',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'role:update' },
      update: {},
      create: {
        name: 'role:update',
        description: 'Update roles',
        resource: 'role',
        action: 'update',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'role:delete' },
      update: {},
      create: {
        name: 'role:delete',
        description: 'Delete roles',
        resource: 'role',
        action: 'delete',
      },
    }),
    prisma.permission.upsert({
      where: { name: 'permission:read' },
      update: {},
      create: {
        name: 'permission:read',
        description: 'Read permissions',
        resource: 'permission',
        action: 'read',
      },
    }),
  ]);

  console.log(`✅ Created ${permissions.length} permissions`);

  // Create Roles
  console.log('Creating roles...');
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access',
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      description: 'Regular user with limited access',
    },
  });

  const moderatorRole = await prisma.role.upsert({
    where: { name: 'moderator' },
    update: {},
    create: {
      name: 'moderator',
      description: 'Moderator with elevated permissions',
    },
  });

  console.log(`✅ Created 3 roles: admin, user, moderator`);

  // Assign all permissions to admin role
  console.log('Assigning permissions to admin role...');
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log('✅ Assigned all permissions to admin role');

  // Assign basic permissions to user role
  console.log('Assigning permissions to user role...');
  const userPermissions = permissions.filter(
    (p) => p.name === 'user:read' || p.name === 'permission:read',
  );
  for (const permission of userPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log('✅ Assigned basic permissions to user role');

  // Assign moderate permissions to moderator role
  console.log('Assigning permissions to moderator role...');
  const moderatorPermissions = permissions.filter(
    (p) =>
      p.name.startsWith('user:') ||
      p.name === 'role:read' ||
      p.name === 'permission:read',
  );
  for (const permission of moderatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: moderatorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: moderatorRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log('✅ Assigned moderate permissions to moderator role');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

