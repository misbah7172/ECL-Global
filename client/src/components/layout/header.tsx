import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import ECLLogo from "@/assets/ECL-Logo.png";
import { Menu, User, LogOut, Phone, MessageSquare, ChevronDown, Calendar, Mail } from "lucide-react";
import "@/styles/airplane-logo.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

// Color Scheme Constants
const COLORS = {
  deepBlue: '#1C4E9C',      // Primary Brand Color
  skyBlue: '#33A9D9',       // Call-to-Action/Accent Color
  midBlue: '#2A7CCD',       // Hover/Secondary Accent Color
  darkGrey: '#4F4F4F',      // Body Text/Secondary Headings
  offWhite: '#F8F8F8',      // Background Color
};

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

  const isActive = (href: string) => location === href;

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <button
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              isActive(item.href)
                ? 'text-white shadow-md'
                : 'text-gray-700 hover:text-white hover:shadow-sm'
            }`}
            style={{
              backgroundColor: isActive(item.href) ? COLORS.deepBlue : 'transparent',
            }}
            onClick={() => {
              // Ensure scroll to top on navigation
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            onMouseEnter={(e) => {
              if (!isActive(item.href)) {
                e.currentTarget.style.backgroundColor = COLORS.skyBlue;
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive(item.href)) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            {item.label}
          </button>
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-md border-b-2" style={{ borderBottomColor: COLORS.skyBlue }}>
      {/* Top Bar - Contact Info */}
      <div className="hidden lg:block border-b" style={{ backgroundColor: COLORS.deepBlue }}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex justify-between items-center h-10 text-white text-xs">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="h-3 w-3" />
                <span>+880 1305841167</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-3 w-3" />
                <span>info@eclglobal.com</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                className="flex items-center space-x-1 hover:opacity-80 transition-opacity"
                style={{ color: COLORS.skyBlue }}
              >
                <MessageSquare className="h-3 w-3" />
                <span>WhatsApp Support</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 ecl-logo-container cursor-pointer group">
              <img src={ECLLogo} alt="ECL Global Logo" className="h-10" />
              <div>
                <h1 
                  className="text-2xl font-bold transition-colors"
                  style={{ color: COLORS.deepBlue }}
                >
                  ECL GLOBAL
                </h1>
                <div className="text-xs -mt-1" style={{ color: COLORS.darkGrey }}>
                  Study Abroad Solution
                </div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <NavLinks />
          </nav>

          {/* Desktop CTA & User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:shadow-md"
                    style={{ 
                      backgroundColor: COLORS.offWhite,
                      color: COLORS.deepBlue 
                    }}
                  >
                    <User className="h-4 w-4" />
                    <span className="font-medium">{user?.firstName}</span>
                    {isAdmin && (
                      <Badge 
                        className="text-xs"
                        style={{ backgroundColor: COLORS.skyBlue }}
                      >
                        Admin
                      </Badge>
                    )}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  asChild
                  className="font-medium"
                  style={{ color: COLORS.deepBlue }}
                >
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button 
                  asChild
                  className="font-semibold text-white shadow-md hover:shadow-lg transition-all"
                  style={{ backgroundColor: COLORS.skyBlue }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.midBlue;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.skyBlue;
                  }}
                >
                  <Link href="/register">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Consultation
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet>
            <SheetTrigger asChild>
              <button 
                className="lg:hidden p-2 rounded-lg transition-all"
                style={{ color: COLORS.deepBlue }}
              >
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col space-y-4 mt-6">
                {/* Mobile Logo */}
                <div className="flex items-center space-x-2 mb-4 pb-4 border-b">
                  <img src={ECLLogo} alt="ECL Global Logo" className="h-10" />
                  <div>
                    <span className="font-bold text-lg" style={{ color: COLORS.deepBlue }}>
                      ECL GLOBAL
                    </span>
                    <div className="text-xs" style={{ color: COLORS.darkGrey }}>
                      Study Abroad Solution
                    </div>
                  </div>
                </div>
                
                {/* Mobile Contact Info */}
                <div className="pb-4 mb-4 space-y-3" style={{ borderBottom: `1px solid ${COLORS.offWhite}` }}>
                  <div className="flex items-center space-x-2" style={{ color: COLORS.darkGrey }}>
                    <Phone className="h-4 w-4" style={{ color: COLORS.skyBlue }} />
                    <span className="text-sm">+880 1305841167</span>
                  </div>
                  <div className="flex items-center space-x-2" style={{ color: COLORS.darkGrey }}>
                    <MessageSquare className="h-4 w-4" style={{ color: COLORS.skyBlue }} />
                    <span className="text-sm">WhatsApp Support</span>
                  </div>
                  <div className="flex items-center space-x-2" style={{ color: COLORS.darkGrey }}>
                    <Mail className="h-4 w-4" style={{ color: COLORS.skyBlue }} />
                    <span className="text-sm">info@eclglobal.com</span>
                  </div>
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex flex-col space-y-2">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <button
                        className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                          isActive(item.href) ? 'text-white shadow-sm' : 'hover:shadow-sm'
                        }`}
                        style={{
                          backgroundColor: isActive(item.href) ? COLORS.deepBlue : COLORS.offWhite,
                          color: isActive(item.href) ? 'white' : COLORS.darkGrey
                        }}
                      >
                        {item.label}
                      </button>
                    </Link>
                  ))}
                </div>
                
                {/* Mobile User Menu */}
                {isAuthenticated ? (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center space-x-2 mb-4 px-2">
                      <User className="h-5 w-5" style={{ color: COLORS.deepBlue }} />
                      <span className="font-medium" style={{ color: COLORS.deepBlue }}>
                        {user?.firstName}
                      </span>
                      {isAdmin && (
                        <Badge 
                          className="text-xs"
                          style={{ backgroundColor: COLORS.skyBlue }}
                        >
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start"
                        asChild
                      >
                        <Link href="/dashboard">
                          <User className="h-4 w-4 mr-2" />
                          Dashboard
                        </Link>
                      </Button>
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start"
                          asChild
                        >
                          <Link href="/admin">
                            <User className="h-4 w-4 mr-2" />
                            Admin Panel
                          </Link>
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-red-600 hover:text-red-700"
                        onClick={logout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t pt-4 mt-4 space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}
                      asChild
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button 
                      className="w-full text-white font-semibold"
                      style={{ backgroundColor: COLORS.skyBlue }}
                      asChild
                    >
                      <Link href="/register">
                        <Calendar className="h-4 w-4 mr-2" />
                        Book Consultation
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
