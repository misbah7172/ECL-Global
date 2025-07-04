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
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  duration: z.string().min(1, "Duration is required"),
  format: z.string().min(1, "Format is required"),
  totalSessions: z.string().optional(),
  syllabus: z.string().optional(),
  lectures: z.array(lectureSchema).min(1, "At least one lecture is required"),
  thumbnail: z.string().optional(),
  featured: z.boolean().default(false),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).default("Beginner"),
  prerequisites: z.string().optional(),
  whatYouWillLearn: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
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
