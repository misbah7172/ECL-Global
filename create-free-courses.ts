import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createFreeCourses() {
  try {
    // First, let's check if we have categories and instructors
    const categories = await prisma.category.findMany();
    const instructors = await prisma.user.findMany({ 
      where: { 
        OR: [
          { role: 'instructor' },
          { role: 'admin' }
        ]
      } 
    });
    
    console.log(`Found ${categories.length} categories and ${instructors.length} instructors`);
    
    if (categories.length === 0 || instructors.length === 0) {
      console.log('No categories or instructors found. Please run the main seed script first.');
      return;
    }

    const freeCourses = [
      {
        title: "Introduction to Web Development",
        description: "A free comprehensive introduction to web development covering HTML, CSS, and basic JavaScript",
        objectives: "Learn the fundamentals of web development and build your first website",
        syllabus: {
          content: "HTML basics, CSS styling, JavaScript fundamentals, responsive design"
        },
        categoryId: categories[0].id,
        instructorId: instructors[0].id,
        price: "0",
        originalPrice: "0",
        duration: "6 hours",
        format: "Online",
        totalSessions: 6,
        isActive: true,
        isFeatured: true,
        isFree: true,
        difficulty: "Beginner",
        whatYouWillLearn: [
          "HTML structure and semantic elements",
          "CSS styling and layouts",
          "Basic JavaScript programming",
          "Responsive web design principles",
          "Building and deploying a simple website"
        ],
        requirements: [
          "Basic computer skills",
          "Text editor (VS Code recommended)",
          "Web browser",
          "Internet connection"
        ],
        lectures: {
          create: [
            {
              title: "HTML Fundamentals",
              description: "Learn the basics of HTML structure and semantic elements",
              duration: 60,
              videoUrl: "https://example.com/html-basics.mp4",
              content: "HTML tags, structure, semantic elements, forms",
              order: 1,
              isFree: true
            },
            {
              title: "CSS Styling Basics",
              description: "Introduction to CSS for styling web pages",
              duration: 75,
              videoUrl: "https://example.com/css-basics.mp4",
              content: "CSS selectors, properties, box model, flexbox",
              order: 2,
              isFree: true
            },
            {
              title: "JavaScript Fundamentals",
              description: "Basic JavaScript programming concepts",
              duration: 90,
              videoUrl: "https://example.com/js-basics.mp4",
              content: "Variables, functions, DOM manipulation, events",
              order: 3,
              isFree: true
            },
            {
              title: "Responsive Design",
              description: "Making websites work on all devices",
              duration: 60,
              videoUrl: "https://example.com/responsive.mp4",
              content: "Media queries, mobile-first design, viewport",
              order: 4,
              isFree: true
            },
            {
              title: "Building Your First Website",
              description: "Put it all together to build a complete website",
              duration: 120,
              videoUrl: "https://example.com/first-website.mp4",
              content: "Project planning, building, testing, deployment",
              order: 5,
              isFree: true
            },
            {
              title: "Deployment and Next Steps",
              description: "Deploy your website and learn what's next",
              duration: 45,
              videoUrl: "https://example.com/deployment.mp4",
              content: "GitHub Pages, domain setup, further learning paths",
              order: 6,
              isFree: true
            }
          ]
        }
      },
      {
        title: "Python Basics for Beginners",
        description: "Learn Python programming from scratch with this free comprehensive course",
        objectives: "Master Python fundamentals and write your first programs",
        syllabus: {
          content: "Python syntax, data types, control structures, functions, basic file handling"
        },
        categoryId: categories[0].id,
        instructorId: instructors[0].id,
        price: "0",
        originalPrice: "0",
        duration: "8 hours",
        format: "Online",
        totalSessions: 8,
        isActive: true,
        isFeatured: false,
        isFree: true,
        difficulty: "Beginner",
        whatYouWillLearn: [
          "Python syntax and basic concepts",
          "Working with variables and data types",
          "Control structures (if, loops)",
          "Functions and modules",
          "File handling and error management",
          "Building simple Python applications"
        ],
        requirements: [
          "Basic computer literacy",
          "Python installed on your computer",
          "Text editor or IDE",
          "Willingness to practice coding"
        ],
        lectures: {
          create: [
            {
              title: "Getting Started with Python",
              description: "Introduction to Python and setting up your development environment",
              duration: 45,
              videoUrl: "https://example.com/python-intro.mp4",
              content: "Python installation, IDLE, first program",
              order: 1,
              isFree: true
            },
            {
              title: "Variables and Data Types",
              description: "Understanding Python variables and different data types",
              duration: 60,
              videoUrl: "https://example.com/python-variables.mp4",
              content: "Strings, numbers, booleans, lists, dictionaries",
              order: 2,
              isFree: true
            },
            {
              title: "Control Structures",
              description: "Learn to control program flow with conditions and loops",
              duration: 75,
              videoUrl: "https://example.com/python-control.mp4",
              content: "if statements, while loops, for loops, break/continue",
              order: 3,
              isFree: true
            },
            {
              title: "Functions and Modules",
              description: "Creating reusable code with functions and modules",
              duration: 90,
              videoUrl: "https://example.com/python-functions.mp4",
              content: "Function definition, parameters, return values, imports",
              order: 4,
              isFree: true
            },
            {
              title: "Working with Files",
              description: "Reading from and writing to files in Python",
              duration: 60,
              videoUrl: "https://example.com/python-files.mp4",
              content: "File operations, reading/writing text, error handling",
              order: 5,
              isFree: true
            },
            {
              title: "Error Handling",
              description: "Managing errors and exceptions in Python",
              duration: 45,
              videoUrl: "https://example.com/python-errors.mp4",
              content: "try/except blocks, error types, debugging",
              order: 6,
              isFree: true
            },
            {
              title: "Building a Simple Project",
              description: "Apply your knowledge to build a complete Python project",
              duration: 120,
              videoUrl: "https://example.com/python-project.mp4",
              content: "Project planning, coding, testing, documentation",
              order: 7,
              isFree: true
            },
            {
              title: "Next Steps in Python",
              description: "Where to go from here in your Python journey",
              duration: 30,
              videoUrl: "https://example.com/python-next.mp4",
              content: "Advanced topics, libraries, career paths",
              order: 8,
              isFree: true
            }
          ]
        }
      },
      {
        title: "Digital Marketing Fundamentals",
        description: "Free introduction to digital marketing strategies and tools",
        objectives: "Understand core digital marketing concepts and strategies",
        syllabus: {
          content: "SEO basics, social media marketing, email marketing, content strategy"
        },
        categoryId: categories.find(c => c.name !== 'Programming')?.id || categories[0].id,
        instructorId: instructors[0].id,
        price: "0",
        originalPrice: "0",
        duration: "5 hours",
        format: "Online",
        totalSessions: 5,
        isActive: true,
        isFeatured: false,
        isFree: true,
        difficulty: "Beginner",
        whatYouWillLearn: [
          "Digital marketing landscape overview",
          "Search Engine Optimization (SEO) basics",
          "Social media marketing strategies",
          "Email marketing fundamentals",
          "Content marketing principles",
          "Analytics and measurement"
        ],
        requirements: [
          "Basic internet knowledge",
          "Social media accounts (optional)",
          "Google account for analytics",
          "Business or personal project to apply concepts"
        ],
        lectures: {
          create: [
            {
              title: "Digital Marketing Overview",
              description: "Understanding the digital marketing ecosystem",
              duration: 60,
              videoUrl: "https://example.com/digital-overview.mp4",
              content: "Digital vs traditional marketing, channels, strategies",
              order: 1,
              isFree: true
            },
            {
              title: "SEO Fundamentals",
              description: "Search Engine Optimization basics for beginners",
              duration: 75,
              videoUrl: "https://example.com/seo-basics.mp4",
              content: "Keywords, on-page SEO, technical SEO, tools",
              order: 2,
              isFree: true
            },
            {
              title: "Social Media Marketing",
              description: "Building your brand on social platforms",
              duration: 60,
              videoUrl: "https://example.com/social-media.mp4",
              content: "Platform strategies, content creation, engagement",
              order: 3,
              isFree: true
            },
            {
              title: "Email Marketing Basics",
              description: "Building and nurturing email lists",
              duration: 45,
              videoUrl: "https://example.com/email-marketing.mp4",
              content: "List building, campaign creation, automation",
              order: 4,
              isFree: true
            },
            {
              title: "Analytics and Measurement",
              description: "Tracking and measuring your digital marketing success",
              duration: 60,
              videoUrl: "https://example.com/analytics.mp4",
              content: "Google Analytics, KPIs, reporting, optimization",
              order: 5,
              isFree: true
            }
          ]
        }
      }
    ];

    for (const courseData of freeCourses) {
      const course = await prisma.course.create({
        data: courseData,
        include: {
          lectures: true,
          category: true,
          instructor: true
        }
      });
      console.log(`Created free course: ${course.title} with ${course.lectures.length} lectures`);
    }

    console.log('✅ Free courses created successfully!');
  } catch (error) {
    console.error('Error creating free courses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFreeCourses();
