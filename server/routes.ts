import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { storage } from "./storage";
import { z } from "zod";
import "./types"; // Import the types extension

// Define validation schemas (replacing Drizzle schemas)
const insertUserSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
  role: z.string().default("student"),
  isActive: z.boolean().default(true),
  stripeCustomerId: z.string().optional(),
  stripeSubscriptionId: z.string().optional(),
});

const insertCourseSchema = z.object({
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
    })).optional(),
  })).default([]),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
  prerequisites: z.string().optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
});

const insertEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  eventType: z.string(),
  eventDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  venue: z.string().optional(),
  isOnline: z.boolean().default(false),
  price: z.number().default(0),
  maxAttendees: z.number().optional(),
  registeredCount: z.number().default(0),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

const insertLeadSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  interest: z.string().min(1),
  message: z.string().optional(),
  source: z.string().default("website"),
  status: z.string().default("new"),
});

const insertMockTestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  testType: z.string(),
  duration: z.number(),
  totalQuestions: z.number(),
  questions: z.any().default([]),
  isActive: z.boolean().default(true),
});

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Warning: STRIPE_SECRET_KEY not found. Payment features will be disabled.');
}

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
}) : null;

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Middleware to check if user is admin
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'instructor')) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Token verification endpoint
  app.get("/api/auth/verify", authenticateToken, async (req, res) => {
    try {
      // If we reach here, the token is valid (verified by middleware)
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
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Token refresh endpoint
  app.post("/api/auth/refresh", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Generate new JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Course routes
  app.get("/api/courses", async (req, res) => {
    try {
      const { categoryId, featured, search, isFree } = req.query;
      const filters: any = {};
      
      if (categoryId) filters.categoryId = parseInt(categoryId as string);
      if (featured === 'true') filters.featured = true;
      if (search) filters.search = search as string;
      if (isFree === 'true') filters.isFree = true;
      
      const courses = await storage.getCourses(filters);
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourseWithDetails(parseInt(req.params.id));
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(course);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/courses", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const courseData = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Categories routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Enrollment routes
  app.post("/api/enrollments", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const { courseId } = req.body;
      
      // Check if already enrolled
      const existingEnrollment = await storage.getEnrollment(req.user.id, courseId);
      if (existingEnrollment) {
        return res.status(400).json({ error: "Already enrolled in this course" });
      }

      const enrollment = await storage.createEnrollment({
        userId: req.user.id,
        courseId,
        progress: 0,
        isActive: true,
      });
      
      res.json(enrollment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/enrollments", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const enrollments = await storage.getEnrollments(req.user.id);
      res.json(enrollments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Mock tests routes
  app.get("/api/mock-tests", async (req, res) => {
    try {
      const { testType } = req.query;
      const mockTests = await storage.getMockTests(testType as string);
      res.json(mockTests);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/mock-tests/:id", async (req, res) => {
    try {
      const mockTest = await storage.getMockTest(parseInt(req.params.id));
      if (!mockTest) {
        return res.status(404).json({ error: "Mock test not found" });
      }
      res.json(mockTest);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/mock-tests", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const mockTestData = insertMockTestSchema.parse(req.body);
      const mockTest = await storage.createMockTest(mockTestData);
      res.json(mockTest);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/mock-tests/:id/start", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const mockTestId = parseInt(req.params.id);
      const attempt = await storage.createMockTestAttempt({
        userId: req.user.id,
        mockTestId,
        answers: [],
        isCompleted: false,
      });
      res.json(attempt);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/mock-test-attempts/:id", authenticateToken, async (req, res) => {
    try {
      const { answers, score, isCompleted, timeSpent } = req.body;
      const attempt = await storage.updateMockTestAttempt(parseInt(req.params.id), {
        answers,
        score,
        isCompleted,
        timeSpent,
        completedAt: isCompleted ? new Date() : undefined,
      });
      res.json(attempt);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/mock-test-attempts", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const attempts = await storage.getMockTestAttempts(req.user.id);
      res.json(attempts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const { upcoming } = req.query;
      const events = await storage.getEvents(upcoming === 'true');
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/events", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/events/:id/register", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }

      const eventId = parseInt(req.params.id);
      const registration = await storage.createEventRegistration({
        userId: req.user.id,
        eventId,
        attended: false,
      });
      res.json(registration);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Branches routes
  app.get("/api/branches", async (req, res) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Leads routes
  app.post("/api/leads", async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(leadData);
      res.json(lead);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/leads", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Payment routes (if Stripe is configured)
  if (stripe) {
    app.post("/api/create-payment-intent", async (req, res) => {
      try {
        const { amount } = req.body;
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    });
  }

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticateToken, async (req, res) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Invalid token" });
      }

      if (req.user.role === 'admin') {
        // Admin stats
        const [courses, events, leads] = await Promise.all([
          storage.getCourses(),
          storage.getEvents(),
          storage.getLeads(),
        ]);
        
        res.json({
          totalCourses: courses.length,
          totalEvents: events.length,
          totalLeads: leads.length,
          recentLeads: leads.slice(0, 5),
        });
      } else {
        // Student stats
        const [enrollments, attempts] = await Promise.all([
          storage.getEnrollments(req.user.id),
          storage.getMockTestAttempts(req.user.id),
        ]);
        
        res.json({
          totalEnrollments: enrollments.length,
          totalAttempts: attempts.length,
          recentAttempts: attempts.slice(0, 5),
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Study Abroad Service routes
  app.get("/api/study-abroad-services", async (req, res) => {
    try {
      const { serviceType, featured, popular, search } = req.query;
      const services = await storage.getStudyAbroadServices({
        serviceType: serviceType as string,
        featured: featured === 'true',
        popular: popular === 'true',
        search: search as string
      });
      res.json(services);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/study-abroad-services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getStudyAbroadService(id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/study-abroad-services/slug/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const service = await storage.getStudyAbroadServiceBySlug(slug);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/study-abroad-services", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const serviceData = req.body;
      const service = await storage.createStudyAbroadService(serviceData);
      res.status(201).json(service);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/study-abroad-services/:id", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const updates = req.body;
      const service = await storage.updateStudyAbroadService(id, updates);
      res.json(service);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/study-abroad-services/:id", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteStudyAbroadService(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Study Abroad Inquiry routes
  app.get("/api/study-abroad-inquiries", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { status, priority, serviceId, assignedTo } = req.query;
      const inquiries = await storage.getStudyAbroadInquiries({
        status: status as string,
        priority: priority as string,
        serviceId: serviceId ? parseInt(serviceId as string) : undefined,
        assignedTo: assignedTo ? parseInt(assignedTo as string) : undefined
      });
      res.json(inquiries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/study-abroad-inquiries/:id", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const inquiry = await storage.getStudyAbroadInquiry(id);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/study-abroad-inquiries", async (req, res) => {
    try {
      const inquiryData = req.body;
      const inquiry = await storage.createStudyAbroadInquiry(inquiryData);
      res.status(201).json(inquiry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/study-abroad-inquiries/:id", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      const updates = req.body;
      const inquiry = await storage.updateStudyAbroadInquiry(id, updates);
      res.json(inquiry);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/study-abroad-inquiries/:id", authenticateToken, async (req, res) => {
    try {
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      await storage.deleteStudyAbroadInquiry(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
