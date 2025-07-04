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
  // Course methods
  async getCourses(filters) {
    const where = { isActive: true };
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
    return await this.db.course.create({
      data: {
        ...courseFields,
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
  price: z.number(),
  originalPrice: z.number().optional(),
  duration: z.string(),
  format: z.string(),
  totalSessions: z.number().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
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
var insertMockTestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  testType: z.string(),
  duration: z.number(),
  totalQuestions: z.number(),
  questions: z.any().default([]),
  isActive: z.boolean().default(true)
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
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
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
      res.status(400).json({ error: error.message });
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
      const { categoryId, featured, search } = req.query;
      const filters = {};
      if (categoryId) filters.categoryId = parseInt(categoryId);
      if (featured === "true") filters.featured = true;
      if (search) filters.search = search;
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
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.json(course);
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
  app2.get("/api/branches", async (req, res) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error) {
      res.status(500).json({ error: error.message });
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
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
