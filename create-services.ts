import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createStudyAbroadServices() {
  const services = await Promise.all([
    prisma.studyAbroadService.create({
      data: {
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
    
    prisma.studyAbroadService.create({
      data: {
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
    
    prisma.studyAbroadService.create({
      data: {
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
    }),
    
    prisma.studyAbroadService.create({
      data: {
        title: 'Career Counseling',
        slug: 'career-counseling',
        description: 'Strategic career planning and academic pathway guidance to achieve your professional goals.',
        shortDesc: 'Strategic career planning and academic pathway guidance',
        serviceType: 'Career Counseling',
        price: 10000,
        duration: '4-6 weeks',
        features: [
          'Career assessment and analysis',
          'Industry insights and trends',
          'Academic pathway planning',
          'Professional networking guidance',
          'Skills development roadmap'
        ],
        countries: ['USA', 'Canada', 'UK', 'Australia', 'Germany', 'Singapore'],
        requirements: [
          'Educational background',
          'Work experience (if any)',
          'Career interests assessment',
          'Professional goals statement'
        ],
        process: [
          'Initial career assessment',
          'Industry and market analysis',
          'Academic pathway mapping',
          'Skills gap identification',
          'Action plan development',
          'Ongoing mentorship'
        ],
        benefits: [
          'Clear career direction',
          'Industry-specific guidance',
          'Academic pathway clarity',
          'Professional networking',
          'Long-term mentorship'
        ],
        isActive: true,
        isFeatured: false,
        isPopular: false,
        order: 4
      }
    })
  ]);

  console.log(`Created ${services.length} Study Abroad Services`);
  return services;
}

createStudyAbroadServices()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Study Abroad Services created successfully!');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
