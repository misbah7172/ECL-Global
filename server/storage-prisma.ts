import { prisma } from "./prisma";

// Define the types manually based on the Prisma schema
export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  objectives?: string;
  syllabus?: any;
  categoryId: number;
  instructorId: number;
  price: number;
  originalPrice?: number;
  duration: string;
  format: string;
  totalSessions: number;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl?: string;
  rating: number;
  enrolledCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: Date;
  completedAt?: Date;
  progress: number;
  isActive: boolean;
}

export interface MockTest {
  id: number;
  title: string;
  description?: string;
  testType: string;
  duration: number;
  totalQuestions: number;
  questions: any;
  isActive: boolean;
  createdAt: Date;
}

export interface MockTestAttempt {
  id: number;
  userId: number;
  mockTestId: number;
  answers?: any;
  score?: number;
  completedAt?: Date;
  timeSpent?: number;
  isCompleted: boolean;
  startedAt: Date;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  eventType: string;
  eventDate: Date;
  endDate?: Date;
  venue?: string;
  isOnline: boolean;
  price: number;
  maxAttendees?: number;
  registeredCount: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface EventRegistration {
  id: number;
  userId: number;
  eventId: number;
  registeredAt: Date;
  attended: boolean;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  phone?: string;
  email?: string;
  hours?: string;
  isMain: boolean;
  isActive: boolean;
}

export interface Lead {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  interest: string;
  message?: string;
  source: string;
  status: string;
  createdAt: Date;
}

// Define the insert types
export type InsertUser = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertCategory = Omit<Category, 'id'>;
export type InsertCourse = Omit<Course, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertEnrollment = Omit<Enrollment, 'id' | 'enrolledAt'>;
export type InsertMockTest = Omit<MockTest, 'id' | 'createdAt'>;
export type InsertMockTestAttempt = Omit<MockTestAttempt, 'id' | 'startedAt'>;
export type InsertEvent = Omit<Event, 'id' | 'createdAt'>;
export type InsertEventRegistration = Omit<EventRegistration, 'id' | 'registeredAt'>;
export type InsertBranch = Omit<Branch, 'id'>;
export type InsertLead = Omit<Lead, 'id' | 'createdAt'>;

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | null>;
  createCategory(insertCategory: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category>;

  // Course methods
  getCourses(filters?: { categoryId?: number; featured?: boolean; search?: string }): Promise<Course[]>;
  getCourse(id: number): Promise<Course | null>;
  getCourseWithDetails(id: number): Promise<any>;
  createCourse(insertCourse: InsertCourse): Promise<Course>;
  updateCourse(id: number, updates: Partial<InsertCourse>): Promise<Course>;

  // Enrollment methods
  getEnrollments(userId: number): Promise<Enrollment[]>;
  getEnrollment(userId: number, courseId: number): Promise<Enrollment | null>;
  createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment>;
  updateEnrollment(id: number, updates: Partial<InsertEnrollment>): Promise<Enrollment>;

  // Mock test methods
  getMockTests(testType?: string): Promise<MockTest[]>;
  getMockTest(id: number): Promise<MockTest | null>;
  createMockTest(insertMockTest: InsertMockTest): Promise<MockTest>;
  getMockTestAttempts(userId: number): Promise<MockTestAttempt[]>;
  createMockTestAttempt(insertAttempt: InsertMockTestAttempt): Promise<MockTestAttempt>;
  updateMockTestAttempt(id: number, updates: Partial<InsertMockTestAttempt>): Promise<MockTestAttempt>;

  // Event methods
  getEvents(upcoming?: boolean): Promise<Event[]>;
  getEvent(id: number): Promise<Event | null>;
  createEvent(insertEvent: InsertEvent): Promise<Event>;
  registerForEvent(userId: number, eventId: number): Promise<EventRegistration>;
  getEventRegistrations(eventId: number): Promise<EventRegistration[]>;
  getUserEventRegistrations(userId: number): Promise<EventRegistration[]>;

  // Branch methods
  getBranches(): Promise<Branch[]>;
  getBranch(id: number): Promise<Branch | null>;
  createBranch(insertBranch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, updates: Partial<InsertBranch>): Promise<Branch>;

  // Lead methods
  getLeads(): Promise<Lead[]>;
  createLead(insertLead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead>;
}

class PrismaStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email }
    });
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { username }
    });
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    return await prisma.user.create({
      data: insertUser
    });
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: updates
    });
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return await prisma.category.findMany({
      where: { isActive: true }
    });
  }

  async getCategory(id: number): Promise<Category | null> {
    return await prisma.category.findUnique({
      where: { id }
    });
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    return await prisma.category.create({
      data: insertCategory
    });
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category> {
    return await prisma.category.update({
      where: { id },
      data: updates
    });
  }

  // Course methods
  async getCourses(filters?: { categoryId?: number; featured?: boolean; search?: string }): Promise<Course[]> {
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
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    return await prisma.course.findMany({
      where,
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCourse(id: number): Promise<Course | null> {
    return await prisma.course.findUnique({
      where: { id }
    });
  }

  async getCourseWithDetails(id: number): Promise<any> {
    return await prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        enrollments: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      }
    });
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    return await prisma.course.create({
      data: insertCourse
    });
  }

  async updateCourse(id: number, updates: Partial<InsertCourse>): Promise<Course> {
    return await prisma.course.update({
      where: { id },
      data: updates
    });
  }

  // Enrollment methods
  async getEnrollments(userId: number): Promise<Enrollment[]> {
    return await prisma.enrollment.findMany({
      where: { userId, isActive: true },
      include: {
        course: {
          include: {
            category: true,
            instructor: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });
  }

  async getEnrollment(userId: number, courseId: number): Promise<Enrollment | null> {
    return await prisma.enrollment.findFirst({
      where: { userId, courseId, isActive: true }
    });
  }

  async createEnrollment(insertEnrollment: InsertEnrollment): Promise<Enrollment> {
    return await prisma.enrollment.create({
      data: insertEnrollment
    });
  }

  async updateEnrollment(id: number, updates: Partial<InsertEnrollment>): Promise<Enrollment> {
    return await prisma.enrollment.update({
      where: { id },
      data: updates
    });
  }

  // Mock test methods
  async getMockTests(testType?: string): Promise<MockTest[]> {
    const where: any = { isActive: true };
    
    if (testType) {
      where.testType = testType;
    }

    return await prisma.mockTest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  async getMockTest(id: number): Promise<MockTest | null> {
    return await prisma.mockTest.findUnique({
      where: { id }
    });
  }

  async createMockTest(insertMockTest: InsertMockTest): Promise<MockTest> {
    return await prisma.mockTest.create({
      data: insertMockTest
    });
  }

  async getMockTestAttempts(userId: number): Promise<MockTestAttempt[]> {
    return await prisma.mockTestAttempt.findMany({
      where: { userId },
      include: {
        mockTest: true
      },
      orderBy: { startedAt: 'desc' }
    });
  }

  async createMockTestAttempt(insertAttempt: InsertMockTestAttempt): Promise<MockTestAttempt> {
    return await prisma.mockTestAttempt.create({
      data: insertAttempt
    });
  }

  async updateMockTestAttempt(id: number, updates: Partial<InsertMockTestAttempt>): Promise<MockTestAttempt> {
    return await prisma.mockTestAttempt.update({
      where: { id },
      data: updates
    });
  }

  // Event methods
  async getEvents(upcoming?: boolean): Promise<Event[]> {
    const where: any = { isActive: true };
    
    if (upcoming) {
      where.eventDate = { gte: new Date() };
    }

    return await prisma.event.findMany({
      where,
      orderBy: { eventDate: 'asc' }
    });
  }

  async getEvent(id: number): Promise<Event | null> {
    return await prisma.event.findUnique({
      where: { id }
    });
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    return await prisma.event.create({
      data: insertEvent
    });
  }

  async registerForEvent(userId: number, eventId: number): Promise<EventRegistration> {
    return await prisma.eventRegistration.create({
      data: {
        userId,
        eventId
      }
    });
  }

  async createEventRegistration(insertEventRegistration: InsertEventRegistration): Promise<EventRegistration> {
    return await prisma.eventRegistration.create({
      data: insertEventRegistration
    });
  }

  async getEventRegistrations(eventId: number): Promise<EventRegistration[]> {
    return await prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });
  }

  async getUserEventRegistrations(userId: number): Promise<EventRegistration[]> {
    return await prisma.eventRegistration.findMany({
      where: { userId },
      include: {
        event: true
      }
    });
  }

  // Branch methods
  async getBranches(): Promise<Branch[]> {
    return await prisma.branch.findMany({
      where: { isActive: true }
    });
  }

  async getBranch(id: number): Promise<Branch | null> {
    return await prisma.branch.findUnique({
      where: { id }
    });
  }

  async createBranch(insertBranch: InsertBranch): Promise<Branch> {
    return await prisma.branch.create({
      data: insertBranch
    });
  }

  async updateBranch(id: number, updates: Partial<InsertBranch>): Promise<Branch> {
    return await prisma.branch.update({
      where: { id },
      data: updates
    });
  }

  // Lead methods
  async getLeads(): Promise<Lead[]> {
    return await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    return await prisma.lead.create({
      data: insertLead
    });
  }

  async updateLead(id: number, updates: Partial<InsertLead>): Promise<Lead> {
    return await prisma.lead.update({
      where: { id },
      data: updates
    });
  }
}

export const storage = new PrismaStorage();
