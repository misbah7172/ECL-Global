// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Stripe from "stripe";

// server/prisma.ts
import { PrismaClient } from "@prisma/client";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var globalForPrisma = globalThis;
var prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ["query", "info", "warn", "error"]
});
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

// server/storage.ts
var Storage = class {
  constructor(db) {
    this.db = db;
  }
  // User methods
  async getUser(id) {
    return await this.db.user.findUnique({
      where: { id }
    });
  }
  async getUserByEmail(email) {
    return await this.db.user.findUnique({
      where: { email }
    });
  }
  async getUserByUsername(username) {
    return await this.db.user.findUnique({
      where: { username }
    });
  }
  async createUser(userData) {
    return await this.db.user.create({
      data: userData
    });
  }
  async updateUser(id, updates) {
    return await this.db.user.update({
      where: { id },
      data: updates
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
        createdAt: true
      }
    });
  }
  async deleteUser(id) {
    return await this.db.user.delete({
      where: { id }
    });
  }
  // Category methods
  async getCategories() {
    return await this.db.category.findMany({
      where: { isActive: true }
    });
  }
  async getCategory(id) {
    return await this.db.category.findUnique({
      where: { id }
    });
  }
  async createCategory(categoryData) {
    return await this.db.category.create({
      data: categoryData
    });
  }
  async updateCategory(id, updates) {
    return await this.db.category.update({
      where: { id },
      data: updates
    });
  }
  async deleteCategory(id) {
    return await this.db.category.delete({
      where: { id }
    });
  }
  // Course methods
  async getCourses(filters) {
    const where = { isActive: true };
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.featured) {
      where.isFeatured = true;
    }
    if (filters?.isFree !== void 0) {
      where.isFree = filters.isFree;
    }
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } }
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
            email: true
          }
        },
        lectures: {
          orderBy: { order: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }
  async getCourse(id) {
    return await this.db.course.findUnique({
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
        lectures: {
          orderBy: { order: "asc" }
        }
      }
    });
  }
  async getCourseWithDetails(id) {
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
            phone: true
          }
        },
        lectures: {
          orderBy: { order: "asc" }
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
            enrolledAt: true,
            progress: true
          }
        }
      }
    });
  }
  async createCourse(courseData) {
    const { lectures, ...courseFields } = courseData;
    if (courseFields.isFree && !courseFields.price) {
      courseFields.price = 0;
    }
    return await this.db.course.create({
      data: {
        ...courseFields,
        lectures: lectures ? {
          create: lectures.map((lecture, index) => ({
            ...lecture,
            order: index + 1,
            isFree: courseFields.isFree || index === 0
            // All lectures are free for free courses, or just first for paid
          }))
        } : void 0
      },
      include: {
        lectures: {
          orderBy: { order: "asc" }
        },
        category: true,
        instructor: {
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
  async updateCourse(id, updates) {
    return await this.db.course.update({
      where: { id },
      data: updates
    });
  }
  // Enrollment methods
  async getEnrollments(userId) {
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
                email: true
              }
            }
          }
        }
      }
    });
  }
  async getEnrollment(userId, courseId) {
    return await this.db.enrollment.findFirst({
      where: {
        userId,
        courseId
      }
    });
  }
  async createEnrollment(enrollmentData) {
    return await this.db.enrollment.create({
      data: enrollmentData
    });
  }
  async updateEnrollment(id, updates) {
    return await this.db.enrollment.update({
      where: { id },
      data: updates
    });
  }
  async getUserEnrollments(userId) {
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
                email: true
              }
            }
          }
        }
      }
    });
  }
  async updateEnrollmentProgress(enrollmentId, progress) {
    return await this.db.enrollment.update({
      where: { id: enrollmentId },
      data: { progress }
    });
  }
  async completeEnrollment(enrollmentId) {
    return await this.db.enrollment.update({
      where: { id: enrollmentId },
      data: {
        completedAt: /* @__PURE__ */ new Date(),
        progress: 100
      }
    });
  }
  // Mock test methods
  async getMockTests(testType) {
    const where = { isActive: true };
    if (testType) {
      where.testType = testType;
    }
    return await this.db.mockTest.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
  }
  async getMockTest(id) {
    return await this.db.mockTest.findUnique({
      where: { id }
    });
  }
  async createMockTest(mockTestData) {
    return await this.db.mockTest.create({
      data: mockTestData
    });
  }
  async getMockTestAttempts(userId) {
    return await this.db.mockTestAttempt.findMany({
      where: { userId },
      include: {
        mockTest: true
      },
      orderBy: { startedAt: "desc" }
    });
  }
  async createMockTestAttempt(attemptData) {
    return await this.db.mockTestAttempt.create({
      data: attemptData
    });
  }
  async updateMockTestAttempt(id, updates) {
    return await this.db.mockTestAttempt.update({
      where: { id },
      data: updates
    });
  }
  async getUserMockTestAttempts(userId) {
    return await this.db.mockTestAttempt.findMany({
      where: { userId },
      include: {
        mockTest: true
      }
    });
  }
  // Event methods
  async getEvents(upcoming) {
    const where = { isActive: true };
    if (upcoming) {
      where.eventDate = { gte: /* @__PURE__ */ new Date() };
    }
    return await this.db.event.findMany({
      where,
      orderBy: { eventDate: "asc" }
    });
  }
  async getEvent(id) {
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
                email: true
              }
            }
          }
        }
      }
    });
  }
  async createEvent(eventData) {
    return await this.db.event.create({
      data: eventData
    });
  }
  async updateEvent(id, updates) {
    return await this.db.event.update({
      where: { id },
      data: updates
    });
  }
  async getEventRegistrations(userId) {
    return await this.db.eventRegistration.findMany({
      where: { userId },
      include: {
        event: true
      }
    });
  }
  async createEventRegistration(registrationData) {
    return await this.db.eventRegistration.create({
      data: registrationData
    });
  }
  async getUserEventRegistrations(userId) {
    return await this.db.eventRegistration.findMany({
      where: { userId },
      include: {
        event: true
      }
    });
  }
  // Branch methods
  async getBranches() {
    return await this.db.branch.findMany({
      where: { isActive: true }
    });
  }
  // Lead methods
  async createLead(leadData) {
    return await this.db.lead.create({
      data: leadData
    });
  }
  async getLeads() {
    return await this.db.lead.findMany({
      orderBy: { createdAt: "desc" }
    });
  }
  // Review methods
  async getReviews(filters) {
    const where = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.featured !== void 0) {
      where.isFeatured = filters.featured;
    }
    return await this.db.review.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            imageUrl: true
          }
        }
      },
      orderBy: [
        { isFeatured: "desc" },
        { createdAt: "desc" }
      ],
      take: filters?.limit
    });
  }
  async createReview(reviewData) {
    return await this.db.review.create({
      data: reviewData
    });
  }
  async updateReview(id, updates) {
    return await this.db.review.update({
      where: { id },
      data: updates
    });
  }
  async deleteReview(id) {
    return await this.db.review.delete({
      where: { id }
    });
  }
  // Free Course methods
  async getFreeCourses(filters) {
    const where = { isActive: true, isFree: true };
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters?.featured) {
      where.isFeatured = true;
    }
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } }
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
            email: true
          }
        },
        lectures: {
          orderBy: { order: "asc" }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }
  async getFreeCourse(id) {
    return await this.db.course.findUnique({
      where: { id, isFree: true },
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
        lectures: {
          orderBy: { order: "asc" }
        }
      }
    });
  }
  async getFreeCourseWithDetails(id) {
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
            phone: true
          }
        },
        lectures: {
          orderBy: { order: "asc" }
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
            enrolledAt: true,
            progress: true
          }
        }
      }
    });
  }
  async createFreeCourse(courseData) {
    const { lectures, ...courseFields } = courseData;
    return await this.db.course.create({
      data: {
        ...courseFields,
        isFree: true,
        lectures: lectures ? {
          create: lectures.map((lecture, index) => ({
            ...lecture,
            order: index + 1,
            isFree: index === 0
            // First lecture is always free
          }))
        } : void 0
      },
      include: {
        lectures: {
          orderBy: { order: "asc" }
        },
        category: true,
        instructor: {
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
  async updateFreeCourse(id, updates) {
    return await this.db.course.update({
      where: { id, isFree: true },
      data: updates
    });
  }
  async deleteFreeCourse(id) {
    return await this.db.course.delete({
      where: { id, isFree: true }
    });
  }
  // Free Course Enrollment methods
  async getFreeCourseEnrollments(userId) {
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
                email: true
              }
            }
          }
        }
      }
    });
  }
  async getFreeCourseEnrollment(userId, courseId) {
    return await this.db.enrollment.findFirst({
      where: {
        userId,
        courseId,
        course: { isFree: true }
      }
    });
  }
  async createFreeCourseEnrollment(enrollmentData) {
    return await this.db.enrollment.create({
      data: enrollmentData
    });
  }
  async updateFreeCourseEnrollment(id, updates) {
    return await this.db.enrollment.update({
      where: { id },
      data: updates
    });
  }
  async getUserFreeCourseEnrollments(userId) {
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
                email: true
              }
            }
          }
        }
      }
    });
  }
  async updateFreeCourseEnrollmentProgress(enrollmentId, progress) {
    return await this.db.enrollment.update({
      where: { id: enrollmentId },
      data: { progress }
    });
  }
  async completeFreeCourseEnrollment(enrollmentId) {
    return await this.db.enrollment.update({
      where: { id: enrollmentId },
      data: {
        completedAt: /* @__PURE__ */ new Date(),
        progress: 100
      }
    });
  }
  // Study Abroad Service methods
  async getStudyAbroadServices(filters) {
    const where = { isActive: true };
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
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } }
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
        { order: "asc" },
        { createdAt: "desc" }
      ]
    });
  }
  async getStudyAbroadService(id) {
    return await this.db.studyAbroadService.findUnique({
      where: { id },
      include: {
        inquiries: {
          orderBy: { createdAt: "desc" },
          take: 10
        },
        _count: {
          select: { inquiries: true }
        }
      }
    });
  }
  async getStudyAbroadServiceBySlug(slug) {
    return await this.db.studyAbroadService.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { inquiries: true }
        }
      }
    });
  }
  async createStudyAbroadService(serviceData) {
    return await this.db.studyAbroadService.create({
      data: serviceData
    });
  }
  async updateStudyAbroadService(id, updates) {
    return await this.db.studyAbroadService.update({
      where: { id },
      data: updates
    });
  }
  async deleteStudyAbroadService(id) {
    return await this.db.studyAbroadService.delete({
      where: { id }
    });
  }
  // Study Abroad Inquiry methods
  async getStudyAbroadInquiries(filters) {
    const where = {};
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
            email: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }
  async getStudyAbroadInquiry(id) {
    return await this.db.studyAbroadInquiry.findUnique({
      where: { id },
      include: {
        service: true,
        assignedUser: {
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
  async createStudyAbroadInquiry(inquiryData) {
    return await this.db.studyAbroadInquiry.create({
      data: inquiryData,
      include: {
        service: true
      }
    });
  }
  async updateStudyAbroadInquiry(id, updates) {
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
            email: true
          }
        }
      }
    });
  }
  async deleteStudyAbroadInquiry(id) {
    return await this.db.studyAbroadInquiry.delete({
      where: { id }
    });
  }
  // Team Member methods
  async getTeamMembers(filters) {
    const where = {};
    if (filters?.active !== void 0) {
      where.isActive = filters.active;
    }
    if (filters?.featured !== void 0) {
      where.isFeatured = filters.featured;
    }
    return await this.db.teamMember.findMany({
      where,
      orderBy: [
        { isFeatured: "desc" },
        { order: "asc" },
        { createdAt: "desc" }
      ],
      take: filters?.limit
    });
  }
  async getTeamMember(id) {
    return await this.db.teamMember.findUnique({
      where: { id }
    });
  }
  async createTeamMember(memberData) {
    return await this.db.teamMember.create({
      data: memberData
    });
  }
  async updateTeamMember(id, updates) {
    return await this.db.teamMember.update({
      where: { id },
      data: updates
    });
  }
  async deleteTeamMember(id) {
    return await this.db.teamMember.delete({
      where: { id }
    });
  }
  async getHomepageSettings() {
    let settings = await this.db.homepageSettings.findFirst();
    if (!settings) {
      settings = await this.db.homepageSettings.create({
        data: {}
      });
    }
    return settings;
  }
  async updateHomepageSettings(updates) {
    const settings = await this.db.homepageSettings.findFirst();
    if (!settings) {
      return await this.db.homepageSettings.create({
        data: updates
      });
    }
    return await this.db.homepageSettings.update({
      where: { id: settings.id },
      data: updates
    });
  }
};
var storage = new Storage(prisma);

// server/routes.ts
import { z } from "zod";
var insertUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  role: z.string().default("student"),
  isActive: z.boolean().default(true),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional()
});
var insertCourseSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  objectives: z.string().optional(),
  syllabus: z.any().optional(),
  categoryId: z.number(),
  instructorId: z.number(),
  price: z.number().optional(),
  originalPrice: z.number().optional(),
  duration: z.string(),
  format: z.string(),
  totalSessions: z.number().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isFree: z.boolean().default(false),
  imageUrl: z.string().optional(),
  rating: z.number().default(0),
  enrolledCount: z.number().default(0),
  lectures: z.array(z.object({
    id: z.string().optional(),
    title: z.string().min(1),
    description: z.string().optional(),
    duration: z.number().min(1),
    videoUrl: z.string().optional(),
    content: z.string().optional(),
    order: z.number().min(1),
    isFree: z.boolean().default(false),
    materials: z.array(z.object({
      title: z.string(),
      url: z.string(),
      type: z.enum(["pdf", "video", "link", "document"])
    })).optional()
  })).default([]),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
  prerequisites: z.string().optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional()
});
var insertEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  eventType: z.string(),
  eventDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : void 0),
  venue: z.string().optional(),
  isOnline: z.boolean().default(false),
  price: z.number().default(0),
  maxAttendees: z.number().optional(),
  registeredCount: z.number().default(0),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true)
});
var insertLeadSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  interest: z.string().min(1),
  message: z.string().optional(),
  source: z.string().default("website"),
  status: z.string().default("new")
});
var insertReviewSchema = z.object({
  courseId: z.coerce.number().optional(),
  courseName: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(1),
  comment: z.string().min(1),
  isFeatured: z.coerce.boolean().default(false)
});
var updateReviewSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  adminResponse: z.string().optional(),
  isVerified: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  helpful: z.coerce.number().optional()
});
var insertTeamMemberSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  specialization: z.string().optional(),
  experience: z.string().optional(),
  credentials: z.string().optional(),
  bio: z.string().min(1),
  imageUrl: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
  order: z.coerce.number().default(0),
  isFeatured: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true)
});
var updateTeamMemberSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
  specialization: z.string().optional(),
  experience: z.string().optional(),
  credentials: z.string().optional(),
  bio: z.string().optional(),
  imageUrl: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  linkedinUrl: z.string().optional(),
  order: z.coerce.number().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional()
});
var insertMockTestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  testType: z.string(),
  duration: z.number(),
  totalQuestions: z.number(),
  questions: z.any().default([]),
  isActive: z.boolean().default(true)
});
var insertBranchSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  address: z.string().min(1),
  city: z.string().min(1),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  managerName: z.string().optional(),
  managerPhone: z.string().optional(),
  managerEmail: z.string().email().optional().or(z.literal("")),
  establishedDate: z.string().optional().transform((value) => value ? new Date(value) : void 0),
  hours: z.string().optional(),
  isActive: z.boolean().default(true)
});
var insertContentItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.coerce.number().default(0),
  mimeType: z.string().min(1),
  duration: z.coerce.number().optional(),
  courseId: z.coerce.number().optional(),
  courseName: z.string().optional(),
  moduleId: z.coerce.number().optional(),
  moduleName: z.string().optional(),
  isPublic: z.coerce.boolean().default(false),
  isActive: z.coerce.boolean().default(true),
  downloadCount: z.coerce.number().default(0),
  viewCount: z.coerce.number().default(0),
  uploadedBy: z.string().min(1),
  tags: z.any().default([]),
  url: z.string().min(1),
  thumbnailUrl: z.string().optional()
});
var insertPaymentSchema = z.object({
  transactionId: z.string().min(1),
  studentId: z.coerce.number(),
  studentName: z.string().min(1),
  studentEmail: z.string().email(),
  courseId: z.coerce.number(),
  courseName: z.string().min(1),
  amount: z.coerce.number(),
  currency: z.string().min(1),
  paymentMethod: z.string().min(1),
  status: z.string().min(1),
  paymentDate: z.string().transform((value) => new Date(value)),
  dueDate: z.string().transform((value) => new Date(value)),
  description: z.string().min(1),
  gatewayTransactionId: z.string().optional(),
  paymentGateway: z.string().min(1),
  refundAmount: z.coerce.number().optional(),
  refundDate: z.string().optional().transform((value) => value ? new Date(value) : void 0),
  refundReason: z.string().optional()
});
var insertBackupSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  status: z.string().min(1),
  size: z.coerce.number().default(0),
  completedAt: z.string().optional().transform((value) => value ? new Date(value) : void 0),
  duration: z.coerce.number().optional(),
  progress: z.coerce.number().optional(),
  includes: z.any().default([]),
  location: z.string().min(1),
  checksum: z.string().default(""),
  isEncrypted: z.coerce.boolean().default(true),
  retentionDays: z.coerce.number().default(7),
  note: z.string().optional()
});
var insertBackupScheduleSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  frequency: z.string().min(1),
  time: z.string().min(1),
  isEnabled: z.coerce.boolean().default(true),
  includes: z.any().default([]),
  location: z.string().min(1),
  retentionDays: z.coerce.number().default(7),
  isEncrypted: z.coerce.boolean().default(true),
  lastRun: z.string().optional().transform((value) => value ? new Date(value) : void 0),
  nextRun: z.string().transform((value) => new Date(value))
});
var JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("Warning: STRIPE_SECRET_KEY not found. Payment features will be disabled.");
}
var stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil"
}) : null;
var authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
var requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin" && req.user.role !== "instructor") {
    return res.status(403).json({ error: "Access denied" });
  }
  next();
};
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      environment: process.env.NODE_ENV || "development"
    });
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const normalizedUsername = userData.username.trim().toLowerCase();
      const normalizedEmail = userData.email.trim().toLowerCase();
      const existingUser = await storage.getUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({ error: "Email is already registered" });
      }
      const existingUsername = await storage.getUserByUsername(normalizedUsername);
      if (existingUsername) {
        return res.status(400).json({ error: "Username is already taken" });
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword
      });
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      const message = String(error?.message || "Registration failed");
      if (message.includes("Unique constraint failed") && message.includes("username")) {
        return res.status(400).json({ error: "Username is already taken" });
      }
      if (message.includes("Unique constraint failed") && message.includes("email")) {
        return res.status(400).json({ error: "Email is already registered" });
      }
      res.status(400).json({ error: message });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/auth/verify", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/auth/refresh", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: "24h" }
      );
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/courses", async (req, res) => {
    try {
      const { categoryId, featured, search, isFree, free } = req.query;
      const filters = {};
      if (categoryId) filters.categoryId = parseInt(categoryId);
      if (featured === "true") filters.featured = true;
      if (search) filters.search = search;
      if (isFree === "true" || free === "true") filters.isFree = true;
      const courses = await storage.getCourses(filters);
      res.json(courses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourseWithDetails(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/courses", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse({
        ...req.body,
        categoryId: parseInt(req.body.categoryId),
        instructorId: parseInt(req.body.instructorId),
        price: parseFloat(req.body.price) || 0,
        originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : null
      });
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.put("/api/courses/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const existingCourse = await prisma.course.findUnique({
        where: { id: courseId }
      });
      if (!existingCourse) {
        return res.status(404).json({ error: "Course not found" });
      }
      const { lectures, ...courseFields } = req.body;
      const courseData = {
        title: courseFields.title,
        description: courseFields.description,
        categoryId: parseInt(courseFields.categoryId),
        instructorId: parseInt(courseFields.instructorId),
        price: parseFloat(courseFields.price) || 0,
        duration: courseFields.duration,
        format: courseFields.format
      };
      if (courseFields.objectives !== void 0) courseData.objectives = courseFields.objectives;
      if (courseFields.originalPrice !== void 0 && courseFields.originalPrice !== null && courseFields.originalPrice !== "") {
        courseData.originalPrice = parseFloat(courseFields.originalPrice);
      }
      if (courseFields.totalSessions !== void 0) courseData.totalSessions = parseInt(courseFields.totalSessions) || 0;
      if (courseFields.syllabus !== void 0) courseData.syllabus = courseFields.syllabus;
      if (courseFields.imageUrl !== void 0) courseData.imageUrl = courseFields.imageUrl;
      if (courseFields.isFeatured !== void 0) courseData.isFeatured = courseFields.isFeatured;
      if (courseFields.difficulty !== void 0) courseData.difficulty = courseFields.difficulty;
      if (courseFields.prerequisites !== void 0) courseData.prerequisites = courseFields.prerequisites;
      if (courseFields.whatYouWillLearn !== void 0) courseData.whatYouWillLearn = courseFields.whatYouWillLearn;
      if (courseFields.requirements !== void 0) courseData.requirements = courseFields.requirements;
      if (lectures && Array.isArray(lectures)) {
        await prisma.lecture.deleteMany({
          where: { courseId }
        });
        courseData.lectures = {
          create: lectures.map((lecture, index) => ({
            title: lecture.title,
            description: lecture.description || "",
            duration: parseInt(lecture.duration) || 0,
            videoUrl: lecture.videoUrl || null,
            content: lecture.content || "",
            order: lecture.order || index + 1,
            isFree: lecture.isFree || false,
            materials: lecture.materials || null
          }))
        };
      }
      console.log("Updating course", courseId, "with data:", courseData);
      const updatedCourse = await prisma.course.update({
        where: { id: courseId },
        data: courseData,
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
          lectures: true
        }
      });
      res.json(updatedCourse);
    } catch (error) {
      console.error("Error updating course:", error);
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/courses/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      await prisma.$transaction(async (tx) => {
        await tx.enrollment.deleteMany({
          where: { courseId }
        });
        await tx.course.delete({
          where: { id: courseId }
        });
      });
      res.json({ message: "Course deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/categories", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { name, description, icon, isActive } = req.body;
      if (!name) {
        return res.status(400).json({ error: "Category name is required" });
      }
      const category = await storage.createCategory({
        name,
        description: description || null,
        icon: icon || null,
        isActive: isActive !== void 0 ? isActive : true
      });
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.put("/api/categories/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description, icon, isActive } = req.body;
      const updates = {};
      if (name !== void 0) updates.name = name;
      if (description !== void 0) updates.description = description;
      if (icon !== void 0) updates.icon = icon;
      if (isActive !== void 0) updates.isActive = isActive;
      const category = await storage.updateCategory(categoryId, updates);
      res.json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/categories/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const courses = await storage.getCourses();
      const categoryHasCourses = courses.some((course) => course.categoryId === categoryId);
      if (categoryHasCourses) {
        return res.status(400).json({
          error: "Cannot delete category with existing courses. Please reassign or delete the courses first."
        });
      }
      await storage.deleteCategory(categoryId);
      res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/enrollments", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }
      const { courseId } = req.body;
      const existingEnrollment = await storage.getEnrollment(req.user.id, courseId);
      if (existingEnrollment) {
        return res.status(400).json({ error: "Already enrolled in this course" });
      }
      const enrollment = await storage.createEnrollment({
        userId: req.user.id,
        courseId,
        progress: 0,
        isActive: true
      });
      res.json(enrollment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/enrollments", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }
      const enrollments = await storage.getEnrollments(req.user.id);
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/enrollments/all", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const enrollments = await prisma.enrollment.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          course: {
            select: {
              id: true,
              title: true,
              price: true,
              category: true
            }
          }
        },
        orderBy: {
          enrolledAt: "desc"
        }
      });
      res.json(enrollments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/enrollments/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.id);
      const { progress, grade, certificateIssued } = req.body;
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId }
      });
      if (!existingEnrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }
      const updatedEnrollment = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          progress: progress !== void 0 ? progress : existingEnrollment.progress,
          grade: grade !== void 0 ? grade : existingEnrollment.grade,
          certificateIssued: certificateIssued !== void 0 ? certificateIssued : existingEnrollment.certificateIssued,
          completedAt: progress === 100 && !existingEnrollment.completedAt ? /* @__PURE__ */ new Date() : existingEnrollment.completedAt
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          course: {
            select: {
              id: true,
              title: true,
              price: true,
              category: true
            }
          }
        }
      });
      res.json(updatedEnrollment);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/mock-tests", async (req, res) => {
    try {
      const { testType } = req.query;
      const mockTests = await storage.getMockTests(testType);
      res.json(mockTests);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/mock-tests/:id", async (req, res) => {
    try {
      const mockTest = await storage.getMockTest(parseInt(req.params.id));
      if (!mockTest) {
        return res.status(404).json({ error: "Mock test not found" });
      }
      res.json(mockTest);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/mock-tests", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const mockTestData = insertMockTestSchema.parse(req.body);
      const mockTest = await storage.createMockTest(mockTestData);
      res.json(mockTest);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.put("/api/mock-tests/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const mockTestId = parseInt(req.params.id);
      const mockTestData = insertMockTestSchema.parse(req.body);
      const mockTest = await storage.updateMockTest(mockTestId, mockTestData);
      res.json(mockTest);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/mock-tests/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const mockTestId = parseInt(req.params.id);
      await storage.deleteMockTest(mockTestId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/mock-tests/:id/start", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }
      const mockTestId = parseInt(req.params.id);
      const attempt = await storage.createMockTestAttempt({
        userId: req.user.id,
        mockTestId,
        answers: [],
        isCompleted: false
      });
      res.json(attempt);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.put("/api/mock-test-attempts/:id", authenticateToken, async (req, res) => {
    try {
      const { answers, score, isCompleted, timeSpent } = req.body;
      const attempt = await storage.updateMockTestAttempt(parseInt(req.params.id), {
        answers,
        score,
        isCompleted,
        timeSpent,
        completedAt: isCompleted ? /* @__PURE__ */ new Date() : void 0
      });
      res.json(attempt);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/mock-test-attempts/all", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const attempts = await storage.getAllMockTestAttempts();
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/mock-test-attempts", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }
      const attempts = await storage.getMockTestAttempts(req.user.id);
      res.json(attempts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/events", async (req, res) => {
    try {
      const { upcoming } = req.query;
      const events = await storage.getEvents(upcoming === "true");
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/events", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/events/:id/register", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }
      const eventId = parseInt(req.params.id);
      const registration = await storage.createEventRegistration({
        userId: req.user.id,
        eventId,
        attended: false
      });
      res.json(registration);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.put("/api/events/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.updateEvent(id, eventData);
      res.json(event);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/events/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEvent(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/branches", async (req, res) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/branches", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/branches", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const branchData = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch({
        ...branchData,
        totalStudents: 0,
        totalCourses: 0,
        totalInstructors: 0,
        monthlyRevenue: 0,
        isMain: false
      });
      res.json(branch);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.put("/api/admin/branches/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const branchData = insertBranchSchema.parse(req.body);
      const branch = await storage.updateBranch(id, {
        ...branchData,
        totalStudents: 0,
        totalCourses: 0,
        totalInstructors: 0,
        monthlyRevenue: 0
      });
      res.json(branch);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/admin/branches/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBranch(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/admin/content", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const contentItems = await storage.getContentItems();
      res.json(contentItems);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/content/courses", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses.map((course) => ({ id: course.id, name: course.title })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/content/upload", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const payload = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        type: z.string().min(1),
        courseId: z.string().optional(),
        moduleId: z.string().optional(),
        isPublic: z.union([z.string(), z.boolean()]).optional(),
        isActive: z.union([z.string(), z.boolean()]).optional(),
        tags: z.string().optional()
      }).parse(req.body);
      const fileExtension = payload.type === "document" ? "pdf" : payload.type === "image" ? "jpg" : payload.type === "audio" ? "mp3" : payload.type === "archive" ? "zip" : "mp4";
      const slug = payload.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const contentItem = await storage.createContentItem({
        title: payload.title,
        description: payload.description,
        type: payload.type,
        fileName: `${slug}.${fileExtension}`,
        fileSize: 0,
        mimeType: payload.type === "document" ? "application/pdf" : payload.type === "image" ? "image/jpeg" : payload.type === "audio" ? "audio/mpeg" : payload.type === "archive" ? "application/zip" : "video/mp4",
        duration: void 0,
        courseId: payload.courseId ? parseInt(payload.courseId) : void 0,
        courseName: void 0,
        moduleId: payload.moduleId ? parseInt(payload.moduleId) : void 0,
        moduleName: void 0,
        isPublic: payload.isPublic === true || payload.isPublic === "true",
        isActive: payload.isActive === void 0 ? true : payload.isActive === true || payload.isActive === "true",
        downloadCount: 0,
        viewCount: 0,
        uploadedBy: req.user?.email || "admin",
        tags: payload.tags ? JSON.parse(payload.tags) : [],
        url: `/content/${slug}.${fileExtension}`,
        thumbnailUrl: void 0
      });
      res.json(contentItem);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.put("/api/admin/content/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = z.object({
        title: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        type: z.string().min(1).optional(),
        courseId: z.coerce.number().optional(),
        courseName: z.string().optional(),
        moduleId: z.coerce.number().optional(),
        moduleName: z.string().optional(),
        isPublic: z.coerce.boolean().optional(),
        isActive: z.coerce.boolean().optional(),
        tags: z.any().optional(),
        thumbnailUrl: z.string().optional(),
        url: z.string().optional()
      }).parse(req.body);
      const contentItem = await storage.updateContentItem(id, updates);
      res.json(contentItem);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/admin/content/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContentItem(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/admin/payments", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/payments/:id/refund", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { amount, reason } = z.object({
        amount: z.coerce.number(),
        reason: z.string().min(1)
      }).parse(req.body);
      const payment = await storage.updatePayment(id, {
        status: "refunded",
        refundAmount: amount,
        refundDate: /* @__PURE__ */ new Date(),
        refundReason: reason
      });
      res.json(payment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/admin/payments/:id/retry", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.updatePayment(id, {
        status: "pending"
      });
      res.json(payment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/admin/backups", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const backups = await storage.getBackups();
      res.json(backups);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/backups", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const now = /* @__PURE__ */ new Date();
      const dateLabel = now.toISOString().slice(0, 10);
      const backup = await storage.createBackup({
        name: `Full System Backup - ${dateLabel}`,
        type: "full",
        status: "completed",
        size: 2048576e3,
        completedAt: now,
        duration: 45,
        progress: 100,
        includes: ["database", "uploads", "configurations", "logs"],
        location: `/backups/full/${dateLabel}.tar.gz`,
        checksum: `sha256:${Date.now()}`,
        isEncrypted: true,
        retentionDays: 30,
        note: "Created from admin backup action"
      });
      res.json(backup);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/admin/backups/:id/restore", authenticateToken, requireAdmin, async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/admin/backups/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBackup(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/admin/backup-schedules", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const schedules = await storage.getBackupSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/backup-schedules", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const scheduleData = insertBackupScheduleSchema.parse(req.body);
      const schedule = await storage.createBackupSchedule(scheduleData);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.put("/api/admin/backup-schedules/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scheduleData = insertBackupScheduleSchema.parse(req.body);
      const schedule = await storage.updateBackupSchedule(id, scheduleData);
      res.json(schedule);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/admin/backup-schedules/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBackupSchedule(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.json(lead);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/leads", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/reviews", async (req, res) => {
    try {
      const { featured, limit } = req.query;
      const reviews = await storage.getReviews({
        status: "approved",
        featured: featured === "true" ? true : void 0,
        limit: limit ? parseInt(limit, 10) : 6
      });
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/reviews", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }
      const reviewData = insertReviewSchema.parse(req.body);
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ error: "User not found" });
      }
      const review = await storage.createReview({
        userId: currentUser.id,
        studentName: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        studentEmail: currentUser.email,
        studentAvatar: void 0,
        courseId: reviewData.courseId,
        courseName: reviewData.courseName,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        status: "pending",
        isVerified: false,
        helpful: 0,
        adminResponse: void 0,
        isFeatured: reviewData.isFeatured
      });
      res.json(review);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/admin/reviews", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { status, featured, limit } = req.query;
      const reviews = await storage.getReviews({
        status: typeof status === "string" && status !== "all" ? status : void 0,
        featured: featured === "true" ? true : featured === "false" ? false : void 0,
        limit: limit ? parseInt(limit, 10) : void 0
      });
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/admin/reviews/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = updateReviewSchema.parse(req.body);
      const review = await storage.updateReview(id, updateData);
      res.json(review);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/admin/reviews/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReview(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/team", async (req, res) => {
    try {
      const { featured, limit } = req.query;
      const members = await storage.getTeamMembers({
        active: true,
        featured: featured === "true" ? true : void 0,
        limit: limit ? parseInt(limit, 10) : void 0
      });
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/team", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const memberData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(memberData);
      res.json(member);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/admin/team", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { featured, limit } = req.query;
      const members = await storage.getTeamMembers({
        featured: featured === "true" ? true : featured === "false" ? false : void 0,
        limit: limit ? parseInt(limit, 10) : void 0
      });
      res.json(members);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/admin/team/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = updateTeamMemberSchema.parse(req.body);
      const member = await storage.updateTeamMember(id, updateData);
      res.json(member);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/admin/team/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTeamMember(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/settings/homepage", async (req, res) => {
    try {
      const settings = await storage.getHomepageSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/admin/settings/homepage", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const settings = await storage.updateHomepageSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  if (stripe) {
    app2.post("/api/create-payment-intent", async (req, res) => {
      try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          // Convert to cents
          currency: "usd"
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  }
  app2.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }
      if (req.user.role === "admin") {
        const [courses, events, leads] = await Promise.all([
          storage.getCourses(),
          storage.getEvents(),
          storage.getLeads()
        ]);
        res.json({
          totalCourses: courses.length,
          totalEvents: events.length,
          totalLeads: leads.length,
          recentLeads: leads.slice(0, 5)
        });
      } else {
        const [enrollments, attempts] = await Promise.all([
          storage.getEnrollments(req.user.id),
          storage.getMockTestAttempts(req.user.id)
        ]);
        res.json({
          totalEnrollments: enrollments.length,
          totalAttempts: attempts.length,
          recentAttempts: attempts.slice(0, 5)
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/instructors", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const instructors = await storage.getUsers();
      const filtered = instructors.filter((user) => user.role === "instructor" || user.role === "admin");
      res.json(filtered.map((user) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      })));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/instructors", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { firstName, lastName, email, username, password, phone, bio, specialization } = req.body;
      if (!firstName || !lastName || !email || !username || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const instructor = await storage.createUser({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        phone: phone || null,
        role: "instructor",
        isActive: true
      });
      res.json({
        id: instructor.id,
        firstName: instructor.firstName,
        lastName: instructor.lastName,
        email: instructor.email,
        username: instructor.username,
        role: instructor.role,
        message: "Instructor created successfully. They can now login with their username and password."
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.put("/api/admin/instructors/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const instructorId = parseInt(req.params.id);
      const { firstName, lastName, email, phone, isActive } = req.body;
      const instructor = await storage.getUser(instructorId);
      if (!instructor) {
        return res.status(404).json({ error: "Instructor not found" });
      }
      if (email && email !== instructor.email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }
      const updates = {};
      if (firstName !== void 0) updates.firstName = firstName;
      if (lastName !== void 0) updates.lastName = lastName;
      if (email !== void 0) updates.email = email;
      if (phone !== void 0) updates.phone = phone;
      if (isActive !== void 0) updates.isActive = isActive;
      const updatedInstructor = await storage.updateUser(instructorId, updates);
      res.json(updatedInstructor);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.delete("/api/admin/instructors/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const instructorId = parseInt(req.params.id);
      const instructor = await storage.getUser(instructorId);
      if (!instructor) {
        return res.status(404).json({ error: "Instructor not found" });
      }
      const courses = await storage.getCourses();
      const instructorHasCourses = courses.some((course) => course.instructorId === instructorId);
      if (instructorHasCourses) {
        return res.status(400).json({
          error: "Cannot delete instructor with existing courses. Please reassign or delete the courses first."
        });
      }
      await storage.updateUser(instructorId, { isActive: false });
      res.json({ success: true, message: "Instructor deleted successfully" });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { role } = req.query;
      const users = await storage.getUsers();
      if (role) {
        const filteredUsers = users.filter((user) => user.role === role);
        return res.json(filteredUsers);
      }
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/study-abroad-services", async (req, res) => {
    try {
      const { serviceType, featured, popular, search } = req.query;
      const services = await storage.getStudyAbroadServices({
        serviceType,
        featured: featured === "true",
        popular: popular === "true",
        search
      });
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/study-abroad-services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getStudyAbroadService(id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/study-abroad-services/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const service = await storage.getStudyAbroadServiceBySlug(slug);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/study-abroad-services", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const serviceData = req.body;
      const service = await storage.createStudyAbroadService(serviceData);
      res.status(201).json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/study-abroad-services/:id", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const updates = req.body;
      const service = await storage.updateStudyAbroadService(id, updates);
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/study-abroad-services/:id", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteStudyAbroadService(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/study-abroad-inquiries", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const { status, priority, serviceId, assignedTo } = req.query;
      const inquiries = await storage.getStudyAbroadInquiries({
        status,
        priority,
        serviceId: serviceId ? parseInt(serviceId) : void 0,
        assignedTo: assignedTo ? parseInt(assignedTo) : void 0
      });
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/study-abroad-inquiries/:id", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const inquiry = await storage.getStudyAbroadInquiry(id);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/study-abroad-inquiries", async (req, res) => {
    try {
      const inquiryData = req.body;
      const inquiry = await storage.createStudyAbroadInquiry(inquiryData);
      res.status(201).json(inquiry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/study-abroad-inquiries/:id", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      const updates = req.body;
      const inquiry = await storage.updateStudyAbroadInquiry(id, updates);
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/study-abroad-inquiries/:id", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      await storage.deleteStudyAbroadInquiry(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5e3;
  const host = "0.0.0.0";
  server.listen(port, host, () => {
    log(`serving on port ${port}`);
  });
})();
