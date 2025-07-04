import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Lock, Eye } from 'lucide-react';

interface TestCoursePreviewProps {
  courseId: number;
  userId?: number;
}

export function TestCoursePreview({ courseId, userId }: TestCoursePreviewProps) {
  const { data: course, isLoading } = useQuery({
    queryKey: [`/api/courses/${courseId}`],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${courseId}`);
      if (!response.ok) throw new Error('Course not found');
      return response.json();
    },
  });

  const { data: enrollment } = useQuery({
    queryKey: [`/api/enrollments/course/${courseId}`],
    queryFn: async () => {
      if (!userId) return null;
      const response = await fetch(`/api/enrollments/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!userId,
  });

  const canAccessLecture = (lectureIndex: number) => {
    // First lecture is always free
    if (lectureIndex === 0) return true;
    // Other lectures require enrollment
    return !!enrollment;
  };

  if (isLoading) return <div>Loading...</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">
          {course.title}
          <Badge variant="secondary" className="ml-2">
            {course.lectures?.length || 0} Lectures
          </Badge>
        </CardTitle>
        <p className="text-gray-600">{course.description}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">৳{course.price}</div>
            <div className="flex space-x-2">
              {!enrollment && (
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview First Lecture
                </Button>
              )}
              <Button>
                {enrollment ? 'Continue Learning' : 'Enroll Now'}
              </Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Course Content</h3>
            <div className="space-y-2">
              {course.lectures?.map((lecture: any, index: number) => (
                <div
                  key={lecture.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    canAccessLecture(index) 
                      ? 'hover:bg-gray-50 border-gray-200' 
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {canAccessLecture(index) ? (
                          <Play className="h-4 w-4 text-green-600" />
                        ) : (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                        <span className="text-sm font-medium">
                          Lecture {index + 1}
                        </span>
                      </div>
                      <h4 className="font-medium">{lecture.title}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      {index === 0 && (
                        <Badge variant="secondary" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Free
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {lecture.duration} min
                      </span>
                    </div>
                  </div>
                  {lecture.description && (
                    <p className="text-sm text-gray-600 mt-2 ml-9">
                      {lecture.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">What You'll Learn</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {course.whatYouWillLearn?.map((item: string, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Requirements</h3>
            <ul className="space-y-1">
              {course.requirements?.map((req: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-sm">{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Instructor</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                {course.instructor?.firstName?.[0]}{course.instructor?.lastName?.[0]}
              </div>
              <div>
                <p className="font-medium">
                  {course.instructor?.firstName} {course.instructor?.lastName}
                </p>
                <p className="text-sm text-gray-600">{course.instructor?.email}</p>
              </div>
            </div>
          </div>

          {enrollment && (
            <div className="border-t pt-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-green-800">You're Enrolled!</p>
                    <p className="text-sm text-green-700">
                      Progress: {enrollment.progress}% • Enrolled on {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default TestCoursePreview;
