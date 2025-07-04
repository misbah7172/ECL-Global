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
  async getCourses(filters?: { categoryId?: number; featured?: boolean; search?: string }) {
    const where: any = { isActive: true };
    
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
    
    return await this.db.course.create({
      data: {
        ...courseFields,
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
}

export const storage = new Storage(prisma);
