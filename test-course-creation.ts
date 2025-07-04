import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCourseCreation() {
  try {
    // First, check available instructors
    const instructors = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'instructor' },
          { role: 'admin' }
        ]
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    console.log('Available instructors:');
    console.table(instructors);

    // Check available categories
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true
      }
    });

    console.log('\nAvailable categories:');
    console.table(categories);

    if (instructors.length > 0 && categories.length > 0) {
      console.log('\n✅ Ready for course creation!');
      console.log(`Use instructor ID: ${instructors[0].id} (${instructors[0].firstName} ${instructors[0].lastName})`);
      console.log(`Use category ID: ${categories[0].id} (${categories[0].name})`);

      // Try creating a test course
      const testCourse = await prisma.course.create({
        data: {
          title: 'Test Course API',
          description: 'Testing course creation via API',
          objectives: 'Test objectives',
          syllabus: { content: 'Test syllabus' },
          categoryId: categories[0].id,
          instructorId: instructors[0].id,
          price: '1000',
          duration: '4 weeks',
          format: 'Online',
          totalSessions: 5,
          isActive: true,
          isFree: false,
          difficulty: 'Beginner',
          whatYouWillLearn: ['Test skill 1', 'Test skill 2'],
          requirements: ['Basic knowledge']
        }
      });

      console.log('\n✅ Test course created successfully!');
      console.log(`Course ID: ${testCourse.id}, Title: ${testCourse.title}`);

      // Clean up - delete the test course
      await prisma.course.delete({
        where: { id: testCourse.id }
      });
      console.log('✅ Test course cleaned up');
    } else {
      console.log('❌ Missing instructors or categories for course creation');
    }

  } catch (error) {
    console.error('❌ Error in course creation test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCourseCreation();
