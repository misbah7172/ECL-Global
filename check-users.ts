import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    console.log('All users:');
    console.table(allUsers);

    const instructors = allUsers.filter(user => user.role === 'instructor' || user.role === 'admin');
    console.log('\nInstructors/Admins:');
    console.table(instructors);

  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
