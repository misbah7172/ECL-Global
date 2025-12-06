import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CourseCard from "@/components/course-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, BookOpen, Gift, GraduationCap, Users, Clock, CheckCircle, Star, ChevronRight } from "lucide-react";

// ECL Global Color Palette
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

export default function FreeCourses() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/courses/free", { search, categoryId: categoryFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoryFilter && categoryFilter !== "all") params.append("categoryId", categoryFilter);
      params.append("isFree", "true");
      
      const url = `/api/courses${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      return response.json();
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            {/* Beautiful Pulsing Animation */}
            <div className="relative w-24 h-24 mb-8">
              {/* Outer ring - pulsing */}
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-75"
                style={{ backgroundColor: COLORS.skyBlue }}
              />
              {/* Middle ring */}
              <div 
                className="absolute inset-2 rounded-full animate-pulse"
                style={{ backgroundColor: COLORS.midBlue }}
              />
              {/* Inner circle with icon */}
              <div 
                className="absolute inset-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: COLORS.deepBlue }}
              >
                <Gift className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                Loading Free Courses
              </h3>
              <p style={{ color: COLORS.darkGrey }}>Preparing your free learning resources...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
      <Header />
      
      {/* Hero Section */}
      <section 
        className="text-white py-20 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 50%, ${COLORS.skyBlue} 100%)`
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-4 border-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mr-4"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Gift className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold">
                Free Courses
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
              Start your learning journey with our expertly crafted free courses. 
              High-quality education accessible to everyone - no cost, no barriers.
            </p>
            
            {/* Features Badges */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              {[
                { icon: Gift, text: "100% Free" },
                { icon: Clock, text: "Lifetime Access" },
                { icon: CheckCircle, text: "No Hidden Fees" },
                { icon: GraduationCap, text: "Expert Instructors" }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-medium"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="py-8 bg-white shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <div className="relative w-full sm:w-96">
                <Search 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" 
                  style={{ color: COLORS.darkGrey }}
                />
                <Input
                  placeholder="Search free courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 border-2 rounded-lg"
                  style={{ borderColor: COLORS.skyBlue }}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger 
                  className="w-full sm:w-56 h-12 border-2 rounded-lg font-medium"
                  style={{ borderColor: COLORS.skyBlue, color: COLORS.deepBlue }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Results Count */}
            <div className="flex items-center gap-3">
              <div 
                className="px-5 py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: COLORS.skyBlue }}
              >
                <BookOpen className="h-5 w-5 inline mr-2" />
                {courses?.length || 0} Free Courses
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(search || categoryFilter !== "all") && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium" style={{ color: COLORS.darkGrey }}>Active Filters:</span>
              {search && (
                <Badge 
                  variant="secondary" 
                  className="px-3 py-1 cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: `${COLORS.skyBlue}20`, color: COLORS.deepBlue }}
                  onClick={() => setSearch("")}
                >
                  Search: "{search}" ✕
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge 
                  variant="secondary" 
                  className="px-3 py-1 cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: `${COLORS.skyBlue}20`, color: COLORS.deepBlue }}
                  onClick={() => setCategoryFilter("all")}
                >
                  {categories?.find((c: any) => c.id.toString() === categoryFilter)?.name} ✕
                </Badge>
              )}
              <button
                onClick={() => { setSearch(""); setCategoryFilter("all"); }}
                className="text-sm underline ml-2"
                style={{ color: COLORS.skyBlue }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Section Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
              Available Free Courses
            </h2>
            <p style={{ color: COLORS.darkGrey }}>
              {courses?.length || 0} course{courses?.length !== 1 ? 's' : ''} ready for you to explore
            </p>
          </div>

          {courses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course: any) => (
                <div key={course.id} className="relative group">
                  <CourseCard course={course} />
                  {/* Free badge */}
                  <div 
                    className="absolute top-4 right-4 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg z-10 flex items-center gap-1"
                    style={{ backgroundColor: COLORS.skyBlue }}
                  >
                    <Gift className="h-4 w-4" />
                    FREE
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto bg-white rounded-2xl p-12 shadow-lg">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                >
                  <Gift className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: COLORS.deepBlue }}>
                  No Free Courses Found
                </h3>
                <p className="mb-6" style={{ color: COLORS.darkGrey }}>
                  {search || categoryFilter !== "all" 
                    ? "We couldn't find any free courses matching your criteria. Try adjusting your filters."
                    : "We're continuously adding new free courses. Check back soon for more learning opportunities!"}
                </p>
                {(search || categoryFilter !== "all") && (
                  <Button
                    onClick={() => {
                      setSearch("");
                      setCategoryFilter("all");
                    }}
                    className="text-white font-semibold"
                    style={{ backgroundColor: COLORS.skyBlue }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>
              Why Choose Our Free Courses?
            </h2>
            <p className="text-lg" style={{ color: COLORS.darkGrey }}>
              Premium quality education without the premium price tag
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: "Expert-Led Content",
                description: "Same high-quality curriculum as our premium courses, taught by industry professionals with 10+ years of experience."
              },
              {
                icon: Gift,
                title: "Truly Free Forever",
                description: "No hidden fees, no credit card required, no time limits. Start learning immediately with lifetime access."
              },
              {
                icon: Users,
                title: "Join 15,000+ Learners",
                description: "Be part of our growing community of successful students who started their journey with our free courses."
              }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="p-8 rounded-xl text-center hover:shadow-xl transition-all duration-300"
                style={{ backgroundColor: COLORS.offWhite }}
              >
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                >
                  <benefit.icon className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: COLORS.deepBlue }}>
                  {benefit.title}
                </h3>
                <p className="leading-relaxed" style={{ color: COLORS.darkGrey }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "15,000+", label: "Active Students" },
              { value: "50+", label: "Free Courses" },
              { value: "4.8/5", label: "Average Rating" },
              { value: "98%", label: "Success Rate" }
            ].map((stat, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-xl"
                style={{ backgroundColor: `${COLORS.deepBlue}10` }}
              >
                <div className="text-3xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium" style={{ color: COLORS.darkGrey }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#1C4E9C] to-[#2A7CCD] text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Star className="h-12 w-12 mx-auto mb-6 text-yellow-300" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Upgrade Your Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Love our free courses? Explore our premium courses for advanced certifications and personalized mentorship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="h-12 px-8 text-white font-semibold shadow-xl"
              style={{ backgroundColor: COLORS.skyBlue }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
            >
              View Premium Courses
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline"
              className="h-12 px-8 border-2 border-white text-white hover:bg-white font-semibold"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = COLORS.deepBlue;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              Book Free Consultation
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
