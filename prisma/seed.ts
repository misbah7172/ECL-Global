import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@eclglobal.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@eclglobal.com',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin user created/updated:', adminUser.email);
  console.log('   Login: admin@eclglobal.com / admin123');
  console.log('\n📝 NOTE: All other data (categories, courses, services, etc.) should be created through the admin panel.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('\n✨ Seed completed successfully!');
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
