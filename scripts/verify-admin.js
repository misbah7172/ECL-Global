import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyAdmin() {
  try {
    // Find the admin user
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@ECL Global.com' },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }

    console.log('✅ Admin user found!');
    console.log('🔍 User Details:');
    console.log(`   📧 Email: ${admin.email}`);
    console.log(`   👤 Username: ${admin.username}`);
    console.log(`   🏷️ Name: ${admin.firstName} ${admin.lastName}`);
    console.log(`   🛡️ Role: ${admin.role}`);
    console.log(`   ✅ Active: ${admin.isActive}`);
    console.log(`   📅 Created: ${admin.createdAt.toISOString()}`);
    console.log(`   🆔 ID: ${admin.id}`);

    // Test password verification
    const testPassword = 'admin123';
    const adminWithPassword = await prisma.user.findUnique({
      where: { email: 'admin@ECL Global.com' },
      select: { password: true }
    });

    if (adminWithPassword) {
      const isValidPassword = await bcrypt.compare(testPassword, adminWithPassword.password);
      console.log(`   🔑 Password Check: ${isValidPassword ? '✅ Valid' : '❌ Invalid'}`);
    }
    
  } catch (error) {
    console.error('❌ Error verifying admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyAdmin();
