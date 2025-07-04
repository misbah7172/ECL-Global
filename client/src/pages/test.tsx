import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { TestCoursePreview } from '@/components/test-course-preview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Clock, Star } from 'lucide-react';

export default function TestPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Course Preview & Lecture System Test</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Features Completed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <Badge variant="secondary" className="mr-2">✓</Badge>
                      Free preview lecture
                    </li>
                    <li className="flex items-center">
                      <Badge variant="secondary" className="mr-2">✓</Badge>
                      Paid enrollment system
                    </li>
                    <li className="flex items-center">
                      <Badge variant="secondary" className="mr-2">✓</Badge>
                      Lecture management
                    </li>
                    <li className="flex items-center">
                      <Badge variant="secondary" className="mr-2">✓</Badge>
                      Admin sidebar
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Test Accounts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium">Admin</p>
                      <p className="text-gray-600">admin@mentor.com / admin123</p>
                    </div>
                    <div>
                      <p className="font-medium">Student</p>
                      <p className="text-gray-600">user@mentor.com / user123</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-purple-600" />
                    Test Course
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">JavaScript Fundamentals</p>
                    <p className="text-gray-600">5 lectures • 1 free preview</p>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 mr-1" />
                      <span>Ready for testing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <TestCoursePreview courseId={1} />

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">As a Non-Enrolled User:</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Can see the first lecture with "Free" badge</li>
                  <li>• Can preview the first lecture content</li>
                  <li>• Other lectures show lock icon</li>
                  <li>• "Enroll Now" button is visible</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">As an Enrolled User:</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Can access all lectures</li>
                  <li>• Shows enrollment status</li>
                  <li>• "Continue Learning" button</li>
                  <li>• Progress tracking available</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 p-6 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Admin Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2">Course Management:</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Create courses with multiple lectures</li>
                  <li>• Set first lecture as free automatically</li>
                  <li>• Lecture manager with drag-and-drop</li>
                  <li>• Rich course metadata</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-2">Admin Sidebar:</h3>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• All sidebar items have functional pages</li>
                  <li>• Consistent layout with AdminLayout</li>
                  <li>• No placeholder pages remaining</li>
                  <li>• Proper loading states</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}
