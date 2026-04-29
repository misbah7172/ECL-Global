import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import Stripe from "stripe";
import { storage } from "./storage";
import { prisma } from "./prisma";
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

const insertReviewSchema = z.object({
  courseId: z.coerce.number().optional(),
  courseName: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().min(1),
  comment: z.string().min(1),
  isFeatured: z.coerce.boolean().default(false),
});

const updateReviewSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  adminResponse: z.string().optional(),
  isVerified: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  helpful: z.coerce.number().optional(),
});

const insertTeamMemberSchema = z.object({
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
  isActive: z.coerce.boolean().default(true),
});

const updateTeamMemberSchema = z.object({
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
  isActive: z.coerce.boolean().optional(),
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

const insertBranchSchema = z.object({
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
  establishedDate: z.string().optional().transform((value) => value ? new Date(value) : undefined),
  hours: z.string().optional(),
  isActive: z.boolean().default(true),
});

const insertContentItemSchema = z.object({
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
  thumbnailUrl: z.string().optional(),
});

const insertPaymentSchema = z.object({
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
  refundDate: z.string().optional().transform((value) => value ? new Date(value) : undefined),
  refundReason: z.string().optional(),
});

const insertBackupSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  status: z.string().min(1),
  size: z.coerce.number().default(0),
  completedAt: z.string().optional().transform((value) => value ? new Date(value) : undefined),
  duration: z.coerce.number().optional(),
  progress: z.coerce.number().optional(),
  includes: z.any().default([]),
  location: z.string().min(1),
  checksum: z.string().default(""),
  isEncrypted: z.coerce.boolean().default(true),
  retentionDays: z.coerce.number().default(7),
  note: z.string().optional(),
});

const insertBackupScheduleSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  frequency: z.string().min(1),
  time: z.string().min(1),
  isEnabled: z.coerce.boolean().default(true),
  includes: z.any().default([]),
  location: z.string().min(1),
  retentionDays: z.coerce.number().default(7),
  isEncrypted: z.coerce.boolean().default(true),
  lastRun: z.string().optional().transform((value) => value ? new Date(value) : undefined),
  nextRun: z.string().transform((value) => new Date(value)),
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
  
  // Health check endpoint for Render
  app.get("/api/health", (req, res) => {
    res.status(200).json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    });
  });

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
      const { categoryId, featured, search, isFree, free } = req.query;
      const filters: any = {};
      
      if (categoryId) filters.categoryId = parseInt(categoryId as string);
      if (featured === 'true') filters.featured = true;
      if (search) filters.search = search as string;
      if (isFree === 'true' || free === 'true') filters.isFree = true;
      
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
      const courseData = insertCourseSchema.parse({
        ...req.body,
        categoryId: parseInt(req.body.categoryId),
        instructorId: parseInt(req.body.instructorId),
        price: parseFloat(req.body.price) || 0,
        originalPrice: req.body.originalPrice ? parseFloat(req.body.originalPrice) : null,
      });
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/courses/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      
      // Check if course exists
      const existingCourse = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!existingCourse) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Extract lectures from request body
      const { lectures, ...courseFields } = req.body;

      // Build update data with proper field mapping
      const courseData: any = {
        title: courseFields.title,
        description: courseFields.description,
        categoryId: parseInt(courseFields.categoryId),
        instructorId: parseInt(courseFields.instructorId),
        price: parseFloat(courseFields.price) || 0,
        duration: courseFields.duration,
        format: courseFields.format,
      };

      // Add optional fields
      if (courseFields.objectives !== undefined) courseData.objectives = courseFields.objectives;
      if (courseFields.originalPrice !== undefined && courseFields.originalPrice !== null && courseFields.originalPrice !== '') {
        courseData.originalPrice = parseFloat(courseFields.originalPrice);
      }
      if (courseFields.totalSessions !== undefined) courseData.totalSessions = parseInt(courseFields.totalSessions) || 0;
      if (courseFields.syllabus !== undefined) courseData.syllabus = courseFields.syllabus;
      if (courseFields.imageUrl !== undefined) courseData.imageUrl = courseFields.imageUrl;
      if (courseFields.isFeatured !== undefined) courseData.isFeatured = courseFields.isFeatured;
      if (courseFields.difficulty !== undefined) courseData.difficulty = courseFields.difficulty;
      if (courseFields.prerequisites !== undefined) courseData.prerequisites = courseFields.prerequisites;
      if (courseFields.whatYouWillLearn !== undefined) courseData.whatYouWillLearn = courseFields.whatYouWillLearn;
      if (courseFields.requirements !== undefined) courseData.requirements = courseFields.requirements;

      // Handle lectures separately if provided
      if (lectures && Array.isArray(lectures)) {
        // Delete existing lectures
        await prisma.lecture.deleteMany({
          where: { courseId: courseId }
        });

        // Create new lectures
        courseData.lectures = {
          create: lectures.map((lecture: any, index: number) => ({
            title: lecture.title,
            description: lecture.description || '',
            duration: parseInt(lecture.duration) || 0,
            videoUrl: lecture.videoUrl || null,
            content: lecture.content || '',
            order: lecture.order || index + 1,
            isFree: lecture.isFree || false,
            materials: lecture.materials || null,
          }))
        };
      }

      console.log('Updating course', courseId, 'with data:', courseData);

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
              email: true,
            }
          },
          lectures: true,
        }
      });
      
      res.json(updatedCourse);
    } catch (error: any) {
      console.error('Error updating course:', error);
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/courses/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      
      // Check if course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId }
      });

      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Delete the course
      await prisma.course.delete({
        where: { id: courseId }
      });
      
      res.json({ message: "Course deleted successfully" });
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

  app.post("/api/categories", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { name, description, icon, isActive } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: "Category name is required" });
      }

      const category = await storage.createCategory({
        name,
        description: description || null,
        icon: icon || null,
        isActive: isActive !== undefined ? isActive : true,
      });
      
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/categories/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const { name, description, icon, isActive } = req.body;

      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (icon !== undefined) updates.icon = icon;
      if (isActive !== undefined) updates.isActive = isActive;

      const category = await storage.updateCategory(categoryId, updates);
      res.json(category);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/categories/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      
      // Check if category has courses
      const courses = await storage.getCourses();
      const categoryHasCourses = courses.some((course: any) => course.categoryId === categoryId);
      
      if (categoryHasCourses) {
        return res.status(400).json({ 
          error: "Cannot delete category with existing courses. Please reassign or delete the courses first." 
        });
      }

      await storage.deleteCategory(categoryId);
      res.json({ success: true, message: "Category deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
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

  // Get all enrollments (admin only)
  app.get("/api/enrollments/all", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const enrollments = await prisma.enrollment.findMany({
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          course: {
            select: {
              id: true,
              title: true,
              price: true,
              category: true,
            }
          }
        },
        orderBy: {
          enrolledAt: 'desc'
        }
      });
      res.json(enrollments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update enrollment (admin only)
  app.put("/api/enrollments/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const enrollmentId = parseInt(req.params.id);
      const { progress, grade, certificateIssued } = req.body;

      // Validate enrollment exists
      const existingEnrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId }
      });

      if (!existingEnrollment) {
        return res.status(404).json({ error: "Enrollment not found" });
      }

      // Update the enrollment
      const updatedEnrollment = await prisma.enrollment.update({
        where: { id: enrollmentId },
        data: {
          progress: progress !== undefined ? progress : existingEnrollment.progress,
          grade: grade !== undefined ? grade : existingEnrollment.grade,
          certificateIssued: certificateIssued !== undefined ? certificateIssued : existingEnrollment.certificateIssued,
          completedAt: progress === 100 && !existingEnrollment.completedAt ? new Date() : existingEnrollment.completedAt,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            }
          },
          course: {
            select: {
              id: true,
              title: true,
              price: true,
              category: true,
            }
          }
        }
      });

      res.json(updatedEnrollment);
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

  app.put("/api/mock-tests/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const mockTestId = parseInt(req.params.id);
      const mockTestData = insertMockTestSchema.parse(req.body);
      const mockTest = await storage.updateMockTest(mockTestId, mockTestData);
      res.json(mockTest);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/mock-tests/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const mockTestId = parseInt(req.params.id);
      await storage.deleteMockTest(mockTestId);
      res.json({ success: true });
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

  app.get("/api/mock-test-attempts/all", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const attempts = await storage.getAllMockTestAttempts();
      res.json(attempts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

  app.put("/api/events/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.updateEvent(id, eventData);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/events/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEvent(id);
      res.json({ success: true });
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

  app.get("/api/admin/branches", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const branches = await storage.getBranches();
      res.json(branches);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/branches", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const branchData = insertBranchSchema.parse(req.body);
      const branch = await storage.createBranch({
        ...branchData,
        totalStudents: 0,
        totalCourses: 0,
        totalInstructors: 0,
        monthlyRevenue: 0,
        isMain: false,
      });
      res.json(branch);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/admin/branches/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const branchData = insertBranchSchema.parse(req.body);
      const branch = await storage.updateBranch(id, {
        ...branchData,
        totalStudents: 0,
        totalCourses: 0,
        totalInstructors: 0,
        monthlyRevenue: 0,
      });
      res.json(branch);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/branches/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBranch(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/content", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const contentItems = await storage.getContentItems();
      res.json(contentItems);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/content/courses", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses.map((course) => ({ id: course.id, name: course.title })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/content/upload", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const payload = z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        type: z.string().min(1),
        courseId: z.string().optional(),
        moduleId: z.string().optional(),
        isPublic: z.union([z.string(), z.boolean()]).optional(),
        isActive: z.union([z.string(), z.boolean()]).optional(),
        tags: z.string().optional(),
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
        duration: undefined,
        courseId: payload.courseId ? parseInt(payload.courseId) : undefined,
        courseName: undefined,
        moduleId: payload.moduleId ? parseInt(payload.moduleId) : undefined,
        moduleName: undefined,
        isPublic: payload.isPublic === true || payload.isPublic === "true",
        isActive: payload.isActive === undefined ? true : payload.isActive === true || payload.isActive === "true",
        downloadCount: 0,
        viewCount: 0,
        uploadedBy: req.user?.email || "admin",
        tags: payload.tags ? JSON.parse(payload.tags) : [],
        url: `/content/${slug}.${fileExtension}`,
        thumbnailUrl: undefined,
      });
      res.json(contentItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/admin/content/:id", authenticateToken, requireAdmin, async (req, res) => {
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
        url: z.string().optional(),
      }).parse(req.body);

      const contentItem = await storage.updateContentItem(id, updates);
      res.json(contentItem);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/content/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContentItem(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/payments", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/payments/:id/refund", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { amount, reason } = z.object({
        amount: z.coerce.number(),
        reason: z.string().min(1),
      }).parse(req.body);

      const payment = await storage.updatePayment(id, {
        status: "refunded",
        refundAmount: amount,
        refundDate: new Date(),
        refundReason: reason,
      });

      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/payments/:id/retry", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const payment = await storage.updatePayment(id, {
        status: "pending",
      });

      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/backups", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const backups = await storage.getBackups();
      res.json(backups);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/backups", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const now = new Date();
      const dateLabel = now.toISOString().slice(0, 10);
      const backup = await storage.createBackup({
        name: `Full System Backup - ${dateLabel}`,
        type: "full",
        status: "completed",
        size: 2048576000,
        completedAt: now,
        duration: 45,
        progress: 100,
        includes: ["database", "uploads", "configurations", "logs"],
        location: `/backups/full/${dateLabel}.tar.gz`,
        checksum: `sha256:${Date.now()}`,
        isEncrypted: true,
        retentionDays: 30,
        note: "Created from admin backup action",
      });

      res.json(backup);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/admin/backups/:id/restore", authenticateToken, requireAdmin, async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/backups/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBackup(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/backup-schedules", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const schedules = await storage.getBackupSchedules();
      res.json(schedules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/backup-schedules", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const scheduleData = insertBackupScheduleSchema.parse(req.body);
      const schedule = await storage.createBackupSchedule(scheduleData);
      res.json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.put("/api/admin/backup-schedules/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const scheduleData = insertBackupScheduleSchema.parse(req.body);
      const schedule = await storage.updateBackupSchedule(id, scheduleData);
      res.json(schedule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/backup-schedules/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBackupSchedule(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
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

  // Review routes
  app.get("/api/reviews", async (req, res) => {
    try {
      const { featured, limit } = req.query;
      const reviews = await storage.getReviews({
        status: "approved",
        featured: featured === "true" ? true : undefined,
        limit: limit ? parseInt(limit as string, 10) : 6,
      });

      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/reviews", authenticateToken, async (req, res) => {
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
        studentAvatar: undefined,
        courseId: reviewData.courseId,
        courseName: reviewData.courseName,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        status: "pending",
        isVerified: false,
        helpful: 0,
        adminResponse: undefined,
        isFeatured: reviewData.isFeatured,
      });

      res.json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/reviews", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { status, featured, limit } = req.query;
      const reviews = await storage.getReviews({
        status: typeof status === "string" && status !== "all" ? status : undefined,
        featured: featured === "true" ? true : featured === "false" ? false : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });

      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/reviews/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = updateReviewSchema.parse(req.body);
      const review = await storage.updateReview(id, updateData);
      res.json(review);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/reviews/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReview(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Team Member routes
  app.get("/api/team", async (req, res) => {
    try {
      const { featured, limit } = req.query;
      const members = await storage.getTeamMembers({
        active: true,
        featured: featured === "true" ? true : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/admin/team", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const memberData = insertTeamMemberSchema.parse(req.body);
      const member = await storage.createTeamMember(memberData);
      res.json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/admin/team", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { featured, limit } = req.query;
      const members = await storage.getTeamMembers({
        featured: featured === "true" ? true : featured === "false" ? false : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      });
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/team/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = updateTeamMemberSchema.parse(req.body);
      const member = await storage.updateTeamMember(id, updateData);
      res.json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/admin/team/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTeamMember(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Homepage Settings routes
  app.get("/api/settings/homepage", async (req, res) => {
    try {
      const settings = await storage.getHomepageSettings();
      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/admin/settings/homepage", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const settings = await storage.updateHomepageSettings(req.body);
      res.json(settings);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
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

  // Users and Instructors routes
  app.get("/api/instructors", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const instructors = await storage.getUsers();
      const filtered = instructors.filter((user: any) => user.role === 'instructor' || user.role === 'admin');
      res.json(filtered.map((user: any) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      })));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create new instructor
  app.post("/api/admin/instructors", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { firstName, lastName, email, username, password, phone, bio, specialization } = req.body;
      
      if (!firstName || !lastName || !email || !username || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already in use" });
      }

      // Check if username is taken
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ error: "Username already taken" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create instructor user
      const instructor = await storage.createUser({
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        phone: phone || null,
        role: 'instructor',
        isActive: true,
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
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Update instructor
  app.put("/api/admin/instructors/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const instructorId = parseInt(req.params.id);
      const { firstName, lastName, email, phone, isActive } = req.body;

      // Check if instructor exists
      const instructor = await storage.getUser(instructorId);
      if (!instructor) {
        return res.status(404).json({ error: "Instructor not found" });
      }

      // If email is being changed, check it's not taken
      if (email && email !== instructor.email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ error: "Email already in use" });
        }
      }

      // Update instructor
      const updates: any = {};
      if (firstName !== undefined) updates.firstName = firstName;
      if (lastName !== undefined) updates.lastName = lastName;
      if (email !== undefined) updates.email = email;
      if (phone !== undefined) updates.phone = phone;
      if (isActive !== undefined) updates.isActive = isActive;

      const updatedInstructor = await storage.updateUser(instructorId, updates);
      res.json(updatedInstructor);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Delete instructor
  app.delete("/api/admin/instructors/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const instructorId = parseInt(req.params.id);

      // Check if instructor exists
      const instructor = await storage.getUser(instructorId);
      if (!instructor) {
        return res.status(404).json({ error: "Instructor not found" });
      }

      // Check if instructor has courses
      const courses = await storage.getCourses();
      const instructorHasCourses = courses.some((course: any) => course.instructorId === instructorId);
      
      if (instructorHasCourses) {
        return res.status(400).json({ 
          error: "Cannot delete instructor with existing courses. Please reassign or delete the courses first." 
        });
      }

      // Soft delete by marking as inactive
      await storage.updateUser(instructorId, { isActive: false });
      res.json({ success: true, message: "Instructor deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { role } = req.query;
      const users = await storage.getUsers();
      
      if (role) {
        const filteredUsers = users.filter((user: any) => user.role === role);
        return res.json(filteredUsers);
      }
      
      res.json(users);
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
