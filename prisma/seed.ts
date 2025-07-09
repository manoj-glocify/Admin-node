import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Super Admin role with all permissions
  const allPermissions = [
    { module: 'dashboard', actions: ['read'] },
    { module: 'users', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'roles', actions: ['create', 'read', 'update', 'delete'] },
    { module: 'permissions', actions: ['create', 'read', 'update', 'delete'] },
    // Add more modules/actions as needed
  ];

  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: {},
    create: {
      name: 'Super Admin',
      description: 'Super admin with all permissions',
      isDefault: false,
      permissions: {
        create: allPermissions,
      },
    },
    include: { permissions: true },
  });

  // 2. Create the first user with Super Admin role
  const hashedPassword = await bcrypt.hash('Admin@123*', 10);
  await prisma.user.upsert({
    where: { email: 'manoj@glocify.com' },
    update: {},
    create: {
      email: 'manoj@glocify.com',
      password: hashedPassword,
      firstName: 'Manoj',
      lastName: 'Kumar',
      roleId: superAdminRole.id,
    },
  });

  // 3. Create default roles (Admin, Editor, Author)
  const defaultRoles = [
    { name: 'Admin', description: 'Admin role', isDefault: true },
    { name: 'Editor', description: 'Editor role', isDefault: false },
    { name: 'Author', description: 'Author role', isDefault: false },
  ];

  for (const role of defaultRoles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 