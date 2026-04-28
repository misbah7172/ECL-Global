import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
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
    where: { email: 'user@eclglobal.com' },
    update: {},
    create: {
      firstName: 'Patel',
      lastName: 'Student',
      email: 'user@eclglobal.com',
      username: 'patelstudent',
      password: await bcrypt.hash('user123', 10),
      role: 'student',
    },
  });

  console.log('Regular user created:', regularUser);

  // Create Study Abroad Services
  const studyAbroadServices = await Promise.all([
    prisma.studyAbroadService.upsert({
      where: { slug: 'university-admission-guidance' },
      update: {},
      create: {
        title: 'University Admission Guidance',
        slug: 'university-admission-guidance',
        description: 'Complete support for university applications including essay writing, application review, and interview preparation.',
        shortDesc: 'Expert guidance for university applications worldwide',
        serviceType: 'University Admission',
        price: 15000,
        duration: '2-3 months',
        features: [
          'Application review and optimization',
          'Essay writing assistance',
          'Interview preparation',
          'University selection guidance',
          'Deadline management'
        ],
        countries: ['USA', 'Canada', 'UK', 'Australia', 'Germany'],
        requirements: [
          'Academic transcripts',
          'English proficiency test scores',
          'Statement of purpose',
          'Letters of recommendation'
        ],
        process: [
          'Initial consultation and assessment',
          'University selection and application strategy',
          'Document preparation and review',
          'Application submission',
          'Interview preparation',
          'Decision support'
        ],
        benefits: [
          'Higher acceptance rates',
          'Personalized application strategy',
          'Expert essay review',
          'Interview coaching',
          'Ongoing support throughout the process'
        ],
        isActive: true,
        isFeatured: true,
        isPopular: true,
        order: 1
      }
    }),
    prisma.studyAbroadService.upsert({
      where: { slug: 'visa-processing-support' },
      update: {},
      create: {
        title: 'Visa Processing Support',
        slug: 'visa-processing-support',
        description: 'Comprehensive visa application support with document preparation, application filing, and interview coaching.',
        shortDesc: 'Complete visa application support with high success rates',
        serviceType: 'Visa Processing',
        price: 8000,
        duration: '3-4 weeks',
        features: [
          'Document preparation and review',
          'Visa application filing',
          'Interview coaching',
          'Follow-up support',
          'Emergency assistance'
        ],
        countries: ['USA', 'Canada', 'UK', 'Australia', 'Schengen'],
        requirements: [
          'Passport',
          'University acceptance letter',
          'Financial statements',
          'Medical examination',
          'Police clearance certificate'
        ],
        process: [
          'Document checklist and preparation',
          'Application form completion',
          'Biometric enrollment',
          'Interview scheduling and coaching',
          'Application tracking',
          'Visa collection'
        ],
        benefits: [
          '98% visa success rate',
          'Expert document review',
          'Interview preparation',
          'Fast processing',
          'Full support until visa approval'
        ],
        isActive: true,
        isFeatured: true,
        isPopular: false,
        order: 2
      }
    }),
    prisma.studyAbroadService.upsert({
      where: { slug: 'scholarship-guidance' },
      update: {},
      create: {
        title: 'Scholarship Guidance',
        slug: 'scholarship-guidance',
        description: 'Maximize your funding opportunities with expert scholarship search and application assistance.',
        shortDesc: 'Expert help to secure scholarships and funding',
        serviceType: 'Scholarship Guidance',
        price: 12000,
        duration: '1-2 months',
        features: [
          'Scholarship database access',
          'Application assistance',
          'Essay and statement writing',
          'Interview preparation',
          'Funding strategy'
        ],
        countries: ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'Netherlands'],
        requirements: [
          'Academic transcripts',
          'Test scores',
          'Letters of recommendation',
          'Personal statement',
          'Financial need documentation'
        ],
        process: [
          'Scholarship search and identification',
          'Eligibility assessment',
          'Application preparation',
          'Document compilation',
          'Application submission',
          'Follow-up and tracking'
        ],
        benefits: [
          'Access to exclusive scholarships',
          'Higher funding success rate',
          'Personalized application strategy',
          'Expert essay review',
          'Continuous support'
        ],
        isActive: true,
        isFeatured: false,
        isPopular: true,
        order: 3
      }
    })
  ]);

  console.log('Study Abroad Services created:', studyAbroadServices.length);

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
