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

export interface Review {
  id: number;
  userId: number;
  courseId?: number | null;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  courseName: string;
  rating: number;
  title: string;
  comment: string;
  status: string;
  isVerified: boolean;
  helpful: number;
  adminResponse?: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  code: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  zipCode?: string;
  country: string;
  phone?: string;
  email?: string;
  managerName?: string;
  managerPhone?: string;
  managerEmail?: string;
  establishedDate?: Date;
  totalStudents: number;
  totalCourses: number;
  totalInstructors: number;
  monthlyRevenue: number;
  hours?: string;
  isMain: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentItem {
  id: number;
  title: string;
  description: string;
  type: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  duration?: number;
  courseId?: number;
  courseName?: string;
  moduleId?: number;
  moduleName?: string;
  isPublic: boolean;
  isActive: boolean;
  downloadCount: number;
  viewCount: number;
  uploadedBy: string;
  uploadedAt: Date;
  updatedAt: Date;
  tags: any;
  url: string;
  thumbnailUrl?: string;
}

export interface Payment {
  id: number;
  transactionId: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  paymentDate: Date;
  dueDate: Date;
  description: string;
  gatewayTransactionId?: string;
  paymentGateway: string;
  refundAmount?: number;
  refundDate?: Date;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Backup {
  id: number;
  name: string;
  type: string;
  status: string;
  size: number;
  createdAt: Date;
  completedAt?: Date;
  duration?: number;
  progress?: number;
  includes: any;
  location: string;
  checksum: string;
  isEncrypted: boolean;
  retentionDays: number;
  note?: string;
}

export interface BackupSchedule {
  id: number;
  name: string;
  type: string;
  frequency: string;
  time: string;
  isEnabled: boolean;
  includes: any;
  location: string;
  retentionDays: number;
  isEncrypted: boolean;
  lastRun?: Date;
  nextRun: Date;
  createdAt: Date;
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
export type InsertReview = Omit<Review, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertMockTest = Omit<MockTest, 'id' | 'createdAt'>;
export type InsertMockTestAttempt = Omit<MockTestAttempt, 'id' | 'startedAt'>;
export type InsertEvent = Omit<Event, 'id' | 'createdAt'>;
export type InsertEventRegistration = Omit<EventRegistration, 'id' | 'registeredAt'>;
export type InsertBranch = Omit<Branch, 'id' | 'createdAt' | 'updatedAt' | 'totalStudents' | 'totalCourses' | 'totalInstructors' | 'monthlyRevenue' | 'isMain'>;
export type InsertContentItem = Omit<ContentItem, 'id' | 'uploadedAt' | 'updatedAt'>;
export type InsertPayment = Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>;
export type InsertBackup = Omit<Backup, 'id' | 'createdAt'>;
export type InsertBackupSchedule = Omit<BackupSchedule, 'id' | 'createdAt'>;
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
  deleteCategory(id: number): Promise<void>;

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

  // Review methods
  getReviews(filters?: { status?: string; featured?: boolean; limit?: number }): Promise<Review[]>;
  createReview(insertReview: InsertReview): Promise<Review>;
  updateReview(id: number, updates: Partial<InsertReview>): Promise<Review>;
  deleteReview(id: number): Promise<void>;

  // Mock test methods
  getMockTests(testType?: string): Promise<MockTest[]>;
  getMockTest(id: number): Promise<MockTest | null>;
  createMockTest(insertMockTest: InsertMockTest): Promise<MockTest>;
  updateMockTest(id: number, insertMockTest: InsertMockTest): Promise<MockTest>;
  deleteMockTest(id: number): Promise<void>;
  getMockTestAttempts(userId: number): Promise<MockTestAttempt[]>;
  getAllMockTestAttempts(): Promise<MockTestAttempt[]>;
  createMockTestAttempt(insertAttempt: InsertMockTestAttempt): Promise<MockTestAttempt>;
  updateMockTestAttempt(id: number, updates: Partial<InsertMockTestAttempt>): Promise<MockTestAttempt>;

  // Event methods
  getEvents(upcoming?: boolean): Promise<Event[]>;
  getEvent(id: number): Promise<Event | null>;
  createEvent(insertEvent: InsertEvent): Promise<Event>;
  updateEvent(id: number, insertEvent: InsertEvent): Promise<Event>;
  deleteEvent(id: number): Promise<Event>;
  registerForEvent(userId: number, eventId: number): Promise<EventRegistration>;
  getEventRegistrations(eventId: number): Promise<EventRegistration[]>;
  getUserEventRegistrations(userId: number): Promise<EventRegistration[]>;

  // Branch methods
  getBranches(): Promise<Branch[]>;
  getBranch(id: number): Promise<Branch | null>;
  createBranch(insertBranch: InsertBranch): Promise<Branch>;
  updateBranch(id: number, updates: Partial<InsertBranch>): Promise<Branch>;
  deleteBranch(id: number): Promise<void>;

  // Content methods
  getContentItems(): Promise<ContentItem[]>;
  createContentItem(insertContentItem: InsertContentItem): Promise<ContentItem>;
  updateContentItem(id: number, updates: Partial<InsertContentItem>): Promise<ContentItem>;
  deleteContentItem(id: number): Promise<void>;

  // Payment methods
  getPayments(): Promise<Payment[]>;
  updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment>;

  // Backup methods
  getBackups(): Promise<Backup[]>;
  createBackup(insertBackup: InsertBackup): Promise<Backup>;
  deleteBackup(id: number): Promise<void>;

  // Backup schedule methods
  getBackupSchedules(): Promise<BackupSchedule[]>;
  createBackupSchedule(insertBackupSchedule: InsertBackupSchedule): Promise<BackupSchedule>;
  updateBackupSchedule(id: number, updates: Partial<InsertBackupSchedule>): Promise<BackupSchedule>;
  deleteBackupSchedule(id: number): Promise<void>;

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

  async deleteCategory(id: number): Promise<void> {
    await prisma.category.delete({
      where: { id }
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

  // Review methods
  async getReviews(filters?: { status?: string; featured?: boolean; limit?: number }): Promise<Review[]> {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.featured !== undefined) {
      where.isFeatured = filters.featured;
    }

    return await prisma.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
      take: filters?.limit,
    });
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    return await prisma.review.create({
      data: insertReview,
    });
  }

  async updateReview(id: number, updates: Partial<InsertReview>): Promise<Review> {
    return await prisma.review.update({
      where: { id },
      data: updates,
    });
  }

  async deleteReview(id: number): Promise<void> {
    await prisma.review.delete({
      where: { id },
    });
  }

  // Mock test methods
  async getMockTests(testType?: string): Promise<MockTest[]> {
    const where: any = {};
    
    if (testType) {
      where.testType = testType;
    }

    return await prisma.mockTest.findMany({
      where,
      include: {
        _count: {
          select: { attempts: true }
        }
      },
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

  async updateMockTest(id: number, insertMockTest: InsertMockTest): Promise<MockTest> {
    return await prisma.mockTest.update({
      where: { id },
      data: insertMockTest
    });
  }

  async deleteMockTest(id: number): Promise<void> {
    await prisma.mockTest.delete({
      where: { id }
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

  async getAllMockTestAttempts(): Promise<MockTestAttempt[]> {
    return await prisma.mockTestAttempt.findMany({
      include: {
        mockTest: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
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

  async updateEvent(id: number, insertEvent: InsertEvent): Promise<Event> {
    return await prisma.event.update({
      where: { id },
      data: insertEvent
    });
  }

  async deleteEvent(id: number): Promise<Event> {
    return await prisma.event.delete({
      where: { id }
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
      orderBy: { createdAt: 'desc' }
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

  async deleteBranch(id: number): Promise<void> {
    await prisma.branch.delete({
      where: { id }
    });
  }

  // Content methods
  async getContentItems(): Promise<ContentItem[]> {
    return await prisma.contentItem.findMany({
      orderBy: { uploadedAt: 'desc' }
    });
  }

  async createContentItem(insertContentItem: InsertContentItem): Promise<ContentItem> {
    return await prisma.contentItem.create({
      data: insertContentItem
    });
  }

  async updateContentItem(id: number, updates: Partial<InsertContentItem>): Promise<ContentItem> {
    return await prisma.contentItem.update({
      where: { id },
      data: updates
    });
  }

  async deleteContentItem(id: number): Promise<void> {
    await prisma.contentItem.delete({
      where: { id }
    });
  }

  // Payment methods
  async getPayments(): Promise<Payment[]> {
    return await prisma.payment.findMany({
      orderBy: { paymentDate: 'desc' }
    });
  }

  async updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment> {
    return await prisma.payment.update({
      where: { id },
      data: updates
    });
  }

  // Backup methods
  async getBackups(): Promise<Backup[]> {
    return await prisma.backup.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createBackup(insertBackup: InsertBackup): Promise<Backup> {
    return await prisma.backup.create({
      data: insertBackup
    });
  }

  async deleteBackup(id: number): Promise<void> {
    await prisma.backup.delete({
      where: { id }
    });
  }

  // Backup schedule methods
  async getBackupSchedules(): Promise<BackupSchedule[]> {
    return await prisma.backupSchedule.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createBackupSchedule(insertBackupSchedule: InsertBackupSchedule): Promise<BackupSchedule> {
    return await prisma.backupSchedule.create({
      data: insertBackupSchedule
    });
  }

  async updateBackupSchedule(id: number, updates: Partial<InsertBackupSchedule>): Promise<BackupSchedule> {
    return await prisma.backupSchedule.update({
      where: { id },
      data: updates
    });
  }

  async deleteBackupSchedule(id: number): Promise<void> {
    await prisma.backupSchedule.delete({
      where: { id }
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
