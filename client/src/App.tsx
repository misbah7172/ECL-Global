import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/lib/auth";
import { queryClient } from "@/lib/queryClient";
import { LoadingScreen } from "@/components/loading-screen";

// Pages
import Home from "@/pages/home";
import Courses from "@/pages/courses";
import CourseDetail from "@/pages/enhanced-course-detail";
import Dashboard from "@/pages/dashboard";
import MockTests from "@/pages/mock-tests";
import Events from "@/pages/events";
import Branches from "@/pages/branches";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCourses from "@/pages/admin/courses";
import AdminStudents from "@/pages/admin/students";
import AdminEvents from "@/pages/admin/events";
import AdminInstructors from "@/pages/admin/instructors";
import AdminLeads from "@/pages/admin/leads";
import AdminAnalytics from "@/pages/admin/analytics";
import AdminCategories from "@/pages/admin/categories";
import AdminSchedules from "@/pages/admin/schedules";
import AdminEnrollments from "@/pages/admin/enrollments";
import AdminAttendance from "@/pages/admin/attendance";
import AdminMockTests from "@/pages/admin/mock-tests";
import AdminAssessments from "@/pages/admin/assessments";
import AdminResults from "@/pages/admin/results";
import AdminContent from "@/pages/admin/content";
import AdminBranches from "@/pages/admin/branches";
import AdminPayments from "@/pages/admin/payments";
import AdminReviews from "@/pages/admin/reviews";
import AdminNotifications from "@/pages/admin/notifications";
import AdminMessages from "@/pages/admin/messages";
import AdminSMS from "@/pages/admin/sms";
import AdminUsers from "@/pages/admin/users";
import AdminSettings from "@/pages/admin/settings";
import AdminBackup from "@/pages/admin/backup";
import AdminProfile from "@/pages/admin/profile";
import TestPage from "@/pages/test";
import NotFound from "@/pages/not-found";
import FreeCourses from "@/pages/free-courses";
import AdminFreeCourses from "@/pages/admin/free-courses";
import StudyAbroadServices from "@/pages/study-abroad-services";
import StudyAbroadServiceDetail from "@/pages/study-abroad-service-detail";
import AdminStudyAbroadServices from "@/pages/admin/study-abroad-services";
import AdminStudyAbroadInquiries from "@/pages/admin/study-abroad-inquiries";

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/courses" component={Courses} />
        <Route path="/free-courses" component={FreeCourses} />
        <Route path="/study-abroad-services" component={StudyAbroadServices} />
        <Route path="/study-abroad-services/:slug" component={StudyAbroadServiceDetail} />
        <Route path="/courses/:id" component={CourseDetail} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/mock-tests" component={MockTests} />
        <Route path="/events" component={Events} />
        <Route path="/branches" component={Branches} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/courses" component={AdminCourses} />
        <Route path="/admin/free-courses" component={AdminFreeCourses} />
        <Route path="/admin/study-abroad-services" component={AdminStudyAbroadServices} />
        <Route path="/admin/study-abroad-inquiries" component={AdminStudyAbroadInquiries} />
        <Route path="/admin/students" component={AdminStudents} />
        <Route path="/admin/events" component={AdminEvents} />
        <Route path="/admin/instructors" component={AdminInstructors} />
        <Route path="/admin/categories" component={AdminCategories} />
        <Route path="/admin/schedules" component={AdminSchedules} />
        <Route path="/admin/enrollments" component={AdminEnrollments} />
        <Route path="/admin/attendance" component={AdminAttendance} />
        <Route path="/admin/mock-tests" component={AdminMockTests} />
        <Route path="/admin/assessments" component={AdminAssessments} />
        <Route path="/admin/results" component={AdminResults} />
        <Route path="/admin/content" component={AdminContent} />
        <Route path="/admin/branches" component={AdminBranches} />
        <Route path="/admin/leads" component={AdminLeads} />
        <Route path="/admin/payments" component={AdminPayments} />
        <Route path="/admin/reviews" component={AdminReviews} />
        <Route path="/admin/notifications" component={AdminNotifications} />
        <Route path="/admin/messages" component={AdminMessages} />
        <Route path="/admin/sms" component={AdminSMS} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/admin/backup" component={AdminBackup} />
        <Route path="/admin/analytics" component={AdminAnalytics} />
        <Route path="/admin/profile" component={AdminProfile} />
        <Route path="/test" component={TestPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
