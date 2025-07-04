import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock, Users, Play, Eye } from "lucide-react";

interface CourseCardProps {
  course: {
    id: number;
    title: string;
    description: string;
    price: string;
    originalPrice?: string;
    duration: string;
    enrolledCount: number;
    rating: string;
    imageUrl?: string;
    isFeatured?: boolean;
    lectures?: Array<{ title: string; isFree?: boolean }>;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="course-card overflow-hidden">
      <img 
        src={course.imageUrl || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=300&fit=crop"} 
        alt={course.title} 
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          {course.isFeatured && (
            <Badge variant="default">BESTSELLER</Badge>
          )}
          <div className="flex items-center text-yellow-400">
            <Star className="h-4 w-4 fill-current" />
            <span className="text-gray-600 text-sm ml-1">{course.rating}</span>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Clock className="h-4 w-4 mr-1" />
          <span>{course.duration}</span>
          <span className="mx-2">•</span>
          <Users className="h-4 w-4 mr-1" />
          <span>{course.enrolledCount}+ enrolled</span>
          {course.lectures && course.lectures.length > 0 && (
            <>
              <span className="mx-2">•</span>
              <Eye className="h-4 w-4 mr-1" />
              <span>Free preview</span>
            </>
          )}
        </div>

        {course.lectures && course.lectures.length > 0 && (
          <div className="mb-4">
            <Badge variant="secondary" className="text-xs">
              <Play className="h-3 w-3 mr-1" />
              First lecture free: "{course.lectures[0].title}"
            </Badge>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-gray-900">৳{course.price}</span>
            {course.originalPrice && (
              <span className="text-gray-500 line-through ml-2">৳{course.originalPrice}</span>
            )}
          </div>
          <Button asChild>
            <Link href={`/courses/${course.id}`}>
              View Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
