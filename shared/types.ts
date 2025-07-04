import { z } from "zod";

// Lecture Schema
export const lectureSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Lecture title is required"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 minute"),
  videoUrl: z.string().optional(),
  content: z.string().optional(),
  order: z.number().min(1, "Order must be at least 1"),
  isFree: z.boolean().default(false),
  materials: z.array(z.object({
    title: z.string(),
    url: z.string(),
    type: z.enum(["pdf", "video", "link", "document"])
  })).optional(),
});

// Enhanced Course Schema with Lectures
export const courseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  objectives: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  instructorId: z.string().min(1, "Instructor is required"),
  price: z.string().optional(),
  originalPrice: z.string().optional(),
  duration: z.string().min(1, "Duration is required"),
  format: z.string().min(1, "Format is required"),
  totalSessions: z.string().optional(),
  syllabus: z.string().optional(),
  lectures: z.array(lectureSchema).min(1, "At least one lecture is required"),
  thumbnail: z.string().optional(),
  featured: z.boolean().default(false),
  isFree: z.boolean().default(false),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
  prerequisites: z.string().optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
});

// Study Abroad Service Schema
export const studyAbroadServiceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().min(1, "Description is required"),
  shortDesc: z.string().optional(),
  serviceType: z.string().min(1, "Service type is required"),
  price: z.string().optional(),
  duration: z.string().optional(),
  features: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  process: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  imageUrl: z.string().optional(),
  iconName: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isPopular: z.boolean().default(false),
  order: z.number().default(0),
});

// Study Abroad Inquiry Schema
export const studyAbroadInquirySchema = z.object({
  id: z.string().optional(),
  serviceId: z.string().min(1, "Service is required"),
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
  course: z.string().optional(),
  university: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  message: z.string().optional(),
  status: z.enum(["new", "contacted", "in_progress", "completed"]).default("new"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

// Type exports
export type Lecture = z.infer<typeof lectureSchema>;
export type Course = z.infer<typeof courseSchema>;
export type CourseFormData = z.infer<typeof courseSchema>;

// Course with enrollment status
export interface CourseWithEnrollment extends Course {
  enrolled?: boolean;
  progress?: number;
  canAccessLecture?: (lectureId: string) => boolean;
}

// API Response types
export interface CourseResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}

export interface EnrollmentResponse {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  completedLectures: string[];
  lastAccessedLecture?: string;
}

// Study Abroad Service Type exports
export type StudyAbroadService = z.infer<typeof studyAbroadServiceSchema>;
export type StudyAbroadInquiry = z.infer<typeof studyAbroadInquirySchema>;
export type StudyAbroadServiceFormData = z.infer<typeof studyAbroadServiceSchema>;
export type StudyAbroadInquiryFormData = z.infer<typeof studyAbroadInquirySchema>;

// Study Abroad API Response types
export interface StudyAbroadServiceResponse {
  services: StudyAbroadService[];
  total: number;
  page: number;
  limit: number;
}

export interface StudyAbroadInquiryResponse {
  inquiries: StudyAbroadInquiry[];
  total: number;
  page: number;
  limit: number;
}
