import { prisma } from "./prisma";
import { PrismaClient } from "@prisma/client";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  createUser(userData: any): Promise<any>;
  updateUser(id: number, updates: any): Promise<any>;
  getUsers(): Promise<any[]>;
  deleteUser(id: number): Promise<any>;

  // Category methods
  getCategories(): Promise<any[]>;
  getCategory(id: number): Promise<any>;
  createCategory(categoryData: any): Promise<any>;
  updateCategory(id: number, updates: any): Promise<any>;

  // Course methods
  getCourses(filters?: { categoryId?: number; featured?: boolean; search?: string }): Promise<any[]>;
  getCourse(id: number): Promise<any>;
  getCourseWithDetails(id: number): Promise<any>;
  createCourse(courseData: any): Promise<any>;
  updateCourse(id: number, updates: any): Promise<any>;

  // Enrollment methods
  getEnrollments(userId: number): Promise<any[]>;
  getEnrollment(userId: number, courseId: number): Promise<any>;
  createEnrollment(enrollmentData: any): Promise<any>;
  updateEnrollment(id: number, updates: any): Promise<any>;
  getUserEnrollments(userId: number): Promise<any[]>;
  updateEnrollmentProgress(enrollmentId: number, progress: number): Promise<any>;
  completeEnrollment(enrollmentId: number): Promise<any>;

  // Mock test methods
  getMockTests(testType?: string): Promise<any[]>;
  getMockTest(id: number): Promise<any>;
  createMockTest(mockTestData: any): Promise<any>;
  getMockTestAttempts(userId: number): Promise<any[]>;
  createMockTestAttempt(attemptData: any): Promise<any>;
  updateMockTestAttempt(id: number, updates: any): Promise<any>;
  getUserMockTestAttempts(userId: number): Promise<any[]>;

  // Event methods
  getEvents(upcoming?: boolean): Promise<any[]>;
  getEvent(id: number): Promise<any>;
  createEvent(eventData: any): Promise<any>;
  updateEvent(id: number, updates: any): Promise<any>;
  getEventRegistrations(userId: number): Promise<any[]>;
  createEventRegistration(registrationData: any): Promise<any>;
  getUserEventRegistrations(userId: number): Promise<any[]>;

  // Branch methods
  getBranches(): Promise<any[]>;

  // Lead methods
  createLead(leadData: any): Promise<any>;
  getLeads(): Promise<any[]>;

  // Free Course methods
  getFreeCourses(filters?: { categoryId?: number; featured?: boolean; search?: string }): Promise<any[]>;
  getFreeCourse(id: number): Promise<any>;
  getFreeCourseWithDetails(id: number): Promise<any>;
  createFreeCourse(courseData: any): Promise<any>;
  updateFreeCourse(id: number, updates: any): Promise<any>;
  deleteFreeCourse(id: number): Promise<any>;

  // Free Course Enrollment methods
  getFreeCourseEnrollments(userId: number): Promise<any[]>;
  getFreeCourseEnrollment(userId: number, courseId: number): Promise<any>;
  createFreeCourseEnrollment(enrollmentData: any): Promise<any>;
  updateFreeCourseEnrollment(id: number, updates: any): Promise<any>;
  getUserFreeCourseEnrollments(userId: number): Promise<any[]>;
  updateFreeCourseEnrollmentProgress(enrollmentId: number, progress: number): Promise<any>;
  completeFreeCourseEnrollment(enrollmentId: number): Promise<any>;

  // Study Abroad Service methods
  getStudyAbroadServices(filters?: { serviceType?: string; featured?: boolean; popular?: boolean; search?: string }): Promise<any[]>;
  getStudyAbroadService(id: number): Promise<any>;
  getStudyAbroadServiceBySlug(slug: string): Promise<any>;
  createStudyAbroadService(serviceData: any): Promise<any>;
  updateStudyAbroadService(id: number, updates: any): Promise<any>;
  deleteStudyAbroadService(id: number): Promise<any>;

  // Study Abroad Inquiry methods
  getStudyAbroadInquiries(filters?: { status?: string; priority?: string; serviceId?: number; assignedTo?: number }): Promise<any[]>;
  getStudyAbroadInquiry(id: number): Promise<any>;
  createStudyAbroadInquiry(inquiryData: any): Promise<any>;
  updateStudyAbroadInquiry(id: number, updates: any): Promise<any>;
  deleteStudyAbroadInquiry(id: number): Promise<any>;
}

export class Storage implements IStorage {
  constructor(private db: PrismaClient) {}

  // User methods
  async getUser(id: number) {
    return await this.db.user.findUnique({
      where: { id },
    });
  }

  async getUserByEmail(email: string) {
    return await this.db.user.findUnique({
      where: { email },
    });
  }

  async getUserByUsername(username: string) {
    return await this.db.user.findUnique({
      where: { username },
    });
  }

  async createUser(userData: any) {
    return await this.db.user.create({
      data: userData,
    });
  }

  async updateUser(id: number, updates: any) {
    return await this.db.user.update({
      where: { id },
      data: updates,
    });
  }

  async getUsers() {
    return await this.db.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async deleteUser(id: number) {
    return await this.db.user.delete({
      where: { id },
    });
  }

  // Category methods
  async getCategories() {
    return await this.db.category.findMany({
      where: { isActive: true },
    });
  }

  async getCategory(id: number) {
    return await this.db.category.findUnique({
      where: { id },
    });
  }

  async createCategory(categoryData: any) {
    return await this.db.category.create({
      data: categoryData,
    });
  }

  async updateCategory(id: number, updates: any) {
    return await this.db.category.update({
      where: { id },
      data: updates,
    });
  }

  // Course methods
  async getCourses(filters?: { categoryId?: number; featured?: boolean; search?: string; isFree?: boolean }) {
    const where: any = { isActive: true };
    
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    
    if (filters?.featured) {
      where.isFeatured = true;
    }
    
    if (filters?.isFree !== undefined) {
      where.isFree = filters.isFree;
    }
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await this.db.course.findMany({
      where,
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lectures: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCourse(id: number) {
    return await this.db.course.findUnique({
      where: { id },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lectures: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async getCourseWithDetails(id: number) {
    return await this.db.course.findUnique({
      where: { id },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        lectures: {
          orderBy: { order: 'asc' },
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
            enrolledAt: true,
            progress: true,
          },
        },
      },
    });
  }

  async createCourse(courseData: any) {
    const { lectures, ...courseFields } = courseData;
    
    // Set default price to 0 for free courses
    if (courseFields.isFree && !courseFields.price) {
      courseFields.price = 0;
    }
    
    return await this.db.course.create({
      data: {
        ...courseFields,
        lectures: lectures ? {
          create: lectures.map((lecture: any, index: number) => ({
            ...lecture,
            order: index + 1,
            isFree: courseFields.isFree || index === 0, // All lectures are free for free courses, or just first for paid
          }))
        } : undefined,
      },
      include: {
        lectures: {
          orderBy: { order: 'asc' },
        },
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async updateCourse(id: number, updates: any) {
    return await this.db.course.update({
      where: { id },
      data: updates,
    });
  }

  // Enrollment methods
  async getEnrollments(userId: number) {
    return await this.db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            category: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async getEnrollment(userId: number, courseId: number) {
    return await this.db.enrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });
  }

  async createEnrollment(enrollmentData: any) {
    return await this.db.enrollment.create({
      data: enrollmentData,
    });
  }

  async updateEnrollment(id: number, updates: any) {
    return await this.db.enrollment.update({
      where: { id },
      data: updates,
    });
  }

  async getUserEnrollments(userId: number) {
    return await this.db.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            category: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async updateEnrollmentProgress(enrollmentId: number, progress: number) {
    return await this.db.enrollment.update({
      where: { id: enrollmentId },
      data: { progress },
    });
  }

  async completeEnrollment(enrollmentId: number) {
    return await this.db.enrollment.update({
      where: { id: enrollmentId },
      data: { 
        completedAt: new Date(),
        progress: 100,
      },
    });
  }

  // Mock test methods
  async getMockTests(testType?: string) {
    const where: any = { isActive: true };
    
    if (testType) {
      where.testType = testType;
    }

    return await this.db.mockTest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMockTest(id: number) {
    return await this.db.mockTest.findUnique({
      where: { id },
    });
  }

  async createMockTest(mockTestData: any) {
    return await this.db.mockTest.create({
      data: mockTestData,
    });
  }

  async getMockTestAttempts(userId: number) {
    return await this.db.mockTestAttempt.findMany({
      where: { userId },
      include: {
        mockTest: true,
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async createMockTestAttempt(attemptData: any) {
    return await this.db.mockTestAttempt.create({
      data: attemptData,
    });
  }

  async updateMockTestAttempt(id: number, updates: any) {
    return await this.db.mockTestAttempt.update({
      where: { id },
      data: updates,
    });
  }

  async getUserMockTestAttempts(userId: number) {
    return await this.db.mockTestAttempt.findMany({
      where: { userId },
      include: {
        mockTest: true,
      },
    });
  }

  // Event methods
  async getEvents(upcoming?: boolean) {
    const where: any = { isActive: true };
    
    if (upcoming) {
      where.eventDate = { gte: new Date() };
    }

    return await this.db.event.findMany({
      where,
      orderBy: { eventDate: 'asc' },
    });
  }

  async getEvent(id: number) {
    return await this.db.event.findUnique({
      where: { id },
      include: {
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async createEvent(eventData: any) {
    return await this.db.event.create({
      data: eventData,
    });
  }

  async updateEvent(id: number, updates: any) {
    return await this.db.event.update({
      where: { id },
      data: updates,
    });
  }

  async getEventRegistrations(userId: number) {
    return await this.db.eventRegistration.findMany({
      where: { userId },
      include: {
        event: true,
      },
    });
  }

  async createEventRegistration(registrationData: any) {
    return await this.db.eventRegistration.create({
      data: registrationData,
    });
  }

  async getUserEventRegistrations(userId: number) {
    return await this.db.eventRegistration.findMany({
      where: { userId },
      include: {
        event: true,
      },
    });
  }

  // Branch methods
  async getBranches() {
    return await this.db.branch.findMany({
      where: { isActive: true },
    });
  }

  // Lead methods
  async createLead(leadData: any) {
    return await this.db.lead.create({
      data: leadData,
    });
  }

  async getLeads() {
    return await this.db.lead.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // Free Course methods
  async getFreeCourses(filters?: { categoryId?: number; featured?: boolean; search?: string }) {
    const where: any = { isActive: true, isFree: true };
    
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    
    if (filters?.featured) {
      where.isFeatured = true;
    }
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await this.db.course.findMany({
      where,
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lectures: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFreeCourse(id: number) {
    return await this.db.course.findUnique({
      where: { id, isFree: true },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lectures: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async getFreeCourseWithDetails(id: number) {
    return await this.db.course.findUnique({
      where: { id, isFree: true },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        lectures: {
          orderBy: { order: 'asc' },
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
            enrolledAt: true,
            progress: true,
          },
        },
      },
    });
  }

  async createFreeCourse(courseData: any) {
    const { lectures, ...courseFields } = courseData;
    
    return await this.db.course.create({
      data: {
        ...courseFields,
        isFree: true,
        lectures: lectures ? {
          create: lectures.map((lecture: any, index: number) => ({
            ...lecture,
            order: index + 1,
            isFree: index === 0, // First lecture is always free
          }))
        } : undefined,
      },
      include: {
        lectures: {
          orderBy: { order: 'asc' },
        },
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async updateFreeCourse(id: number, updates: any) {
    return await this.db.course.update({
      where: { id, isFree: true },
      data: updates,
    });
  }

  async deleteFreeCourse(id: number) {
    return await this.db.course.delete({
      where: { id, isFree: true },
    });
  }

  // Free Course Enrollment methods
  async getFreeCourseEnrollments(userId: number) {
    return await this.db.enrollment.findMany({
      where: { userId, course: { isFree: true } },
      include: {
        course: {
          include: {
            category: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async getFreeCourseEnrollment(userId: number, courseId: number) {
    return await this.db.enrollment.findFirst({
      where: {
        userId,
        courseId,
        course: { isFree: true },
      },
    });
  }

  async createFreeCourseEnrollment(enrollmentData: any) {
    return await this.db.enrollment.create({
      data: enrollmentData,
    });
  }

  async updateFreeCourseEnrollment(id: number, updates: any) {
    return await this.db.enrollment.update({
      where: { id },
      data: updates,
    });
  }

  async getUserFreeCourseEnrollments(userId: number) {
    return await this.db.enrollment.findMany({
      where: { userId, course: { isFree: true } },
      include: {
        course: {
          include: {
            category: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async updateFreeCourseEnrollmentProgress(enrollmentId: number, progress: number) {
    return await this.db.enrollment.update({
      where: { id: enrollmentId },
      data: { progress },
    });
  }

  async completeFreeCourseEnrollment(enrollmentId: number) {
    return await this.db.enrollment.update({
      where: { id: enrollmentId },
      data: { 
        completedAt: new Date(),
        progress: 100,
      },
    });
  }

  // Study Abroad Service methods
  async getStudyAbroadServices(filters?: { serviceType?: string; featured?: boolean; popular?: boolean; search?: string }) {
    const where: any = { isActive: true };
    
    if (filters?.serviceType) {
      where.serviceType = filters.serviceType;
    }
    
    if (filters?.featured) {
      where.isFeatured = true;
    }
    
    if (filters?.popular) {
      where.isPopular = true;
    }
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await this.db.studyAbroadService.findMany({
      where,
      include: {
        _count: {
          select: { inquiries: true }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ],
    });
  }

  async getStudyAbroadService(id: number) {
    return await this.db.studyAbroadService.findUnique({
      where: { id },
      include: {
        inquiries: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: { inquiries: true }
        }
      },
    });
  }

  async getStudyAbroadServiceBySlug(slug: string) {
    return await this.db.studyAbroadService.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { inquiries: true }
        }
      },
    });
  }

  async createStudyAbroadService(serviceData: any) {
    return await this.db.studyAbroadService.create({
      data: serviceData,
    });
  }

  async updateStudyAbroadService(id: number, updates: any) {
    return await this.db.studyAbroadService.update({
      where: { id },
      data: updates,
    });
  }

  async deleteStudyAbroadService(id: number) {
    return await this.db.studyAbroadService.delete({
      where: { id },
    });
  }

  // Study Abroad Inquiry methods
  async getStudyAbroadInquiries(filters?: { status?: string; priority?: string; serviceId?: number; assignedTo?: number }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    
    if (filters?.serviceId) {
      where.serviceId = filters.serviceId;
    }
    
    if (filters?.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }

    return await this.db.studyAbroadInquiry.findMany({
      where,
      include: {
        service: true,
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStudyAbroadInquiry(id: number) {
    return await this.db.studyAbroadInquiry.findUnique({
      where: { id },
      include: {
        service: true,
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async createStudyAbroadInquiry(inquiryData: any) {
    return await this.db.studyAbroadInquiry.create({
      data: inquiryData,
      include: {
        service: true,
      },
    });
  }

  async updateStudyAbroadInquiry(id: number, updates: any) {
    return await this.db.studyAbroadInquiry.update({
      where: { id },
      data: updates,
      include: {
        service: true,
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteStudyAbroadInquiry(id: number) {
    return await this.db.studyAbroadInquiry.delete({
      where: { id },
    });
  }
}

export const storage = new Storage(prisma);
