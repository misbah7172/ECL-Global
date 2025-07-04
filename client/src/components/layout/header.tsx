import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import AnimatedAirplaneLogo from "@/components/animated-airplane-logo";
import { Menu, User, LogOut, Phone, MessageSquare, ChevronDown } from "lucide-react";
import "@/styles/airplane-logo.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const navItems = [
    { href: "/courses", label: "Courses" },
    { href: "/free-courses", label: "Free Courses" },
    { href: "/study-abroad-services", label: "Study Abroad" },
    { href: "/mock-tests", label: "Mock Tests" },
    { href: "/events", label: "Events" },
    { href: "/branches", label: "Branches" },
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={location === item.href ? "default" : "ghost"}
            className="text-sm font-medium hover:bg-blue-50 hover:text-blue-700"
          >
            {item.label}
          </Button>
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/90 border-b border-gray-200 shadow-sm">
      <div className="container flex h-20 items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center space-x-3 ecl-logo-container">
            <AnimatedAirplaneLogo size="md" />
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ECL Global
              </span>
              <div className="text-xs text-gray-500 -mt-1">Study Abroad Experts</div>
            </div>
          </div>
        </Link>

        {/* Contact Info - Desktop Only */}
        <div className="hidden lg:flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Phone className="h-4 w-4" />
            <span>+880 1777-123456</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp Support</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center space-x-2">
          <NavLinks />
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{user?.firstName}</span>
                  {isAdmin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <User className="h-4 w-4 mr-2" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col space-y-4 mt-6">
              <div className="flex items-center space-x-2 mb-4">
                <AnimatedAirplaneLogo size="sm" />
                <span className="font-bold text-lg text-gray-900">ECL Global</span>
              </div>
              
              {/* Contact Info */}
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center space-x-2 text-gray-600 mb-2">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">+880 1777-123456</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-sm">WhatsApp Support</span>
                </div>
              </div>

              <NavLinks />
              
              {isAuthenticated ? (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <User className="h-4 w-4" />
                    <span>{user?.firstName}</span>
                    {isAdmin && <Badge variant="secondary" className="text-xs">Admin</Badge>}
                  </div>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/dashboard">
                        <User className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/admin">
                          <User className="h-4 w-4 mr-2" />
                          Admin Panel
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" className="w-full justify-start" onClick={logout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <Button variant="ghost" className="w-full" asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
