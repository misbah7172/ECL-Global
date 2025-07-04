import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import AnimatedPlaneLogo from "@/components/animated-plane-logo";
import { Menu, User, LogOut, Phone, MessageSquare, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  const [location] = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();

  const navItems = [
    { href: "/courses", label: "Courses" },
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
            <AnimatedPlaneLogo size="md" />
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
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  {user?.firstName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Panel</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                <NavLinks />
                {!isAuthenticated && (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full justify-start">
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
