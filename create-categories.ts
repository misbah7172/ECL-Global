import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createCategories() {
  try {
    const categories = [
      {
        name: 'Digital Marketing',
        description: 'Digital marketing and online business courses',
        isActive: true
      },
      {
        name: 'Data Science',
        description: 'Data science, analytics, and machine learning courses',
        isActive: true
      },
      {
        name: 'Design',
        description: 'UI/UX design, graphic design, and creative courses',
        isActive: true
      },
      {
        name: 'Business',
        description: 'Business strategy, entrepreneurship, and management courses',
        isActive: true
      },
      {
        name: 'Languages',
        description: 'Foreign languages and communication skills',
        isActive: true
      }
    ];

    for (const categoryData of categories) {
      // Check if category already exists
      const existing = await prisma.category.findFirst({
        where: { name: categoryData.name }
      });

      if (!existing) {
        const category = await prisma.category.create({
          data: categoryData
        });
        console.log(`Created category: ${category.name}`);
      } else {
        console.log(`Category already exists: ${categoryData.name}`);
      }
    }

    console.log('✅ Categories creation completed!');
  } catch (error) {
    console.error('Error creating categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCategories();
