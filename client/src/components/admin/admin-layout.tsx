import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  FileText,
  Settings,
  MessageSquare,
  DollarSign,
  BarChart,
  MapPin,
  User,
  Bell,
  Menu,
  LogOut,
  GraduationCap,
  ClipboardList,
  FileVideo,
  Shield,
  Database,
  Star,
  Mail,
  Phone,
  UserCheck,
  CreditCard,
  Download,
  Upload,
  Eye,
  Plus,
  Search,
  Filter,
  RefreshCw,
  X
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const adminNavItems = [
  {
    category: "Overview",
    items: [
      { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/admin/analytics", icon: BarChart, label: "Analytics" },
    ]
  },
  {
    category: "Course Management",
    items: [
      { href: "/admin/courses", icon: BookOpen, label: "Courses" },
      { href: "/admin/instructors", icon: GraduationCap, label: "Instructors" },
      { href: "/admin/categories", icon: FileText, label: "Categories" },
      { href: "/admin/schedules", icon: Calendar, label: "Schedules" },
    ]
  },
  {
    category: "Student Management",
    items: [
      { href: "/admin/students", icon: Users, label: "Students" },
      { href: "/admin/enrollments", icon: UserCheck, label: "Enrollments" },
      { href: "/admin/attendance", icon: ClipboardList, label: "Attendance" },
    ]
  },
  {
    category: "Assessments",
    items: [
      { href: "/admin/mock-tests", icon: FileText, label: "Mock Tests" },
      { href: "/admin/assessments", icon: ClipboardList, label: "Assessments" },
      { href: "/admin/results", icon: BarChart, label: "Results" },
    ]
  },
  {
    category: "Content & Events",
    items: [
      { href: "/admin/events", icon: Calendar, label: "Events" },
      { href: "/admin/content", icon: FileVideo, label: "Content Library" },
      { href: "/admin/branches", icon: MapPin, label: "Branches" },
    ]
  },
  {
    category: "Sales & Marketing",
    items: [
      { href: "/admin/leads", icon: MessageSquare, label: "Leads" },
      { href: "/admin/payments", icon: DollarSign, label: "Payments" },
      { href: "/admin/reviews", icon: Star, label: "Reviews" },
    ]
  },
  {
    category: "Communication",
    items: [
      { href: "/admin/notifications", icon: Bell, label: "Notifications" },
      { href: "/admin/messages", icon: Mail, label: "Messages" },
      { href: "/admin/sms", icon: Phone, label: "SMS" },
    ]
  },
  {
    category: "System",
    items: [
      { href: "/admin/users", icon: Shield, label: "User Management" },
      { href: "/admin/settings", icon: Settings, label: "Settings" },
      { href: "/admin/backup", icon: Database, label: "Backup" },
    ]
  },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location === "/admin";
    }
    return location.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <AdminSidebar onNavigate={() => setSidebarOpen(false)} />
                </SheetContent>
              </Sheet>
              
              <div className="flex items-center space-x-4">
                <Link href="/admin" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <span className="font-bold text-xl hidden sm:block">Mentor Admin</span>
                </Link>
                {title && (
                  <>
                    <div className="text-gray-300">/</div>
                    <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                  3
                </Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block">{user?.firstName} {user?.lastName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar - Desktop */}
        <aside className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 md:top-16">
          <AdminSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-72">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

interface AdminSidebarProps {
  onNavigate?: () => void;
}

function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const [location] = useLocation();
  
  const isActive = (href: string) => {
    if (href === "/admin") {
      return location === "/admin";
    }
    return location.startsWith(href);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-8 px-4">
          {adminNavItems.map((category) => (
            <div key={category.category}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {category.category}
              </h3>
              <ul className="space-y-1">
                {category.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(item.href)
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
