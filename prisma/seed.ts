import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mentor.com' },
    update: {},
    create: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@mentor.com',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Admin user created:', adminUser);

  // Create a test category
  const category = await prisma.category.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Programming',
      description: 'Programming courses',
    },
  });

  console.log('Category created:', category);

  // Create a test course with lectures
  const course = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'JavaScript Fundamentals',
      description: 'Learn JavaScript from scratch with hands-on examples',
      objectives: 'Master JavaScript fundamentals and build real projects',
      categoryId: category.id,
      instructorId: adminUser.id,
      price: 2500,
      originalPrice: 3500,
      duration: '8 hours',
      format: 'Online',
      totalSessions: 10,
      syllabus: {
        content: 'Variables, Functions, Objects, Arrays, DOM manipulation'
      },
      difficulty: 'Beginner',
      whatYouWillLearn: [
        'JavaScript syntax and fundamentals',
        'DOM manipulation techniques',
        'Event handling',
        'Asynchronous programming',
        'ES6+ features'
      ],
      requirements: [
        'Basic computer skills',
        'Text editor installed',
        'Web browser'
      ],
      lectures: {
        create: [
          {
            title: 'Introduction to JavaScript - Free Preview',
            description: 'Get started with JavaScript basics. This lecture is free for everyone!',
            duration: 45,
            videoUrl: 'https://example.com/intro-js.mp4',
            content: 'Introduction to JavaScript, history, and basic concepts',
            order: 1,
            isFree: true,
          },
          {
            title: 'Variables and Data Types',
            description: 'Learn about JavaScript variables and different data types',
            duration: 60,
            videoUrl: 'https://example.com/variables.mp4',
            content: 'var, let, const, strings, numbers, booleans, objects, arrays',
            order: 2,
            isFree: false,
          },
          {
            title: 'Functions and Scope',
            description: 'Understanding functions, parameters, and scope in JavaScript',
            duration: 75,
            videoUrl: 'https://example.com/functions.mp4',
            content: 'Function declarations, expressions, arrow functions, scope',
            order: 3,
            isFree: false,
          },
          {
            title: 'Objects and Arrays',
            description: 'Working with objects and arrays in JavaScript',
            duration: 90,
            videoUrl: 'https://example.com/objects-arrays.mp4',
            content: 'Object literals, array methods, destructuring',
            order: 4,
            isFree: false,
          },
          {
            title: 'DOM Manipulation',
            description: 'Learn to manipulate the Document Object Model',
            duration: 80,
            videoUrl: 'https://example.com/dom.mp4',
            content: 'Selecting elements, modifying content, event listeners',
            order: 5,
            isFree: false,
          }
        ]
      }
    },
  });

  console.log('Course with lectures created:', course);

  // Create a regular user for testing
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@mentor.com' },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Student',
      email: 'user@mentor.com',
      username: 'johnstudent',
      password: await bcrypt.hash('user123', 10),
      role: 'student',
    },
  });

  console.log('Regular user created:', regularUser);

  console.log('Seed data created successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
