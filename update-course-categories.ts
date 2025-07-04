import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCourseCategories() {
  try {
    // Update Digital Marketing course to use Digital Marketing category
    const digitalMarketingCourse = await prisma.course.findFirst({
      where: { title: 'Digital Marketing Fundamentals' }
    });

    if (digitalMarketingCourse) {
      await prisma.course.update({
        where: { id: digitalMarketingCourse.id },
        data: { categoryId: 2 } // Digital Marketing category
      });
      console.log('Updated Digital Marketing course category');
    }

    console.log('✅ Course categories updated successfully!');
  } catch (error) {
    console.error('Error updating course categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCourseCategories();
