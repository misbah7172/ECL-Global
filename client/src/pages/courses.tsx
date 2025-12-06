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
import { Search, Filter, BookOpen, GraduationCap, TrendingUp, Award, ChevronRight, Star, Users } from "lucide-react";

// Color Scheme Constants
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

export default function Courses() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const { data: courses, isLoading } = useQuery({
    queryKey: ["/api/courses", { search, categoryId: categoryFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (categoryFilter && categoryFilter !== "all") params.append("categoryId", categoryFilter);
      
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
                <BookOpen className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                Loading Courses
              </h3>
              <p style={{ color: COLORS.darkGrey }}>Discovering amazing learning opportunities...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Filter courses by difficulty
  const filteredCourses = Array.isArray(courses) 
    ? courses.filter((course: any) => 
        difficultyFilter === "all" || course.difficulty === difficultyFilter
      )
    : [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.offWhite }}>
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1C4E9C] via-[#2A7CCD] to-[#33A9D9]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=600&fit=crop')] bg-cover bg-center opacity-10"></div>
        
        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge 
              className="mb-6 text-white border-white/30"
              style={{ backgroundColor: `${COLORS.skyBlue}40` }}
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Comprehensive Learning Programs
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Explore Our Courses
            </h1>
            
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Choose from expert-led courses designed to help you achieve your IELTS, TOEFL, SAT, and study abroad goals.
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search 
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5" 
                    style={{ color: COLORS.skyBlue }} 
                  />
                  <Input
                    placeholder="Search courses, skills, or topics..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-12 border-2 focus:border-2"
                    style={{ borderColor: COLORS.offWhite }}
                    onFocus={(e) => e.currentTarget.style.borderColor = COLORS.skyBlue}
                    onBlur={(e) => e.currentTarget.style.borderColor = COLORS.offWhite}
                  />
                </div>
                <Button 
                  className="h-12 px-8 text-white font-semibold shadow-lg"
                  style={{ backgroundColor: COLORS.skyBlue }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="relative border-t border-white/20 bg-white/10 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
              <div>
                <div className="text-3xl font-bold mb-1" style={{ color: COLORS.skyBlue }}>
                  {filteredCourses.length}+
                </div>
                <div className="text-sm text-blue-100">Expert Courses</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1" style={{ color: COLORS.skyBlue }}>
                  15K+
                </div>
                <div className="text-sm text-blue-100">Students Enrolled</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1" style={{ color: COLORS.skyBlue }}>
                  4.8
                </div>
                <div className="text-sm text-blue-100">Average Rating</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1" style={{ color: COLORS.skyBlue }}>
                  98%
                </div>
                <div className="text-sm text-blue-100">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5" style={{ color: COLORS.deepBlue }} />
              <span className="font-semibold" style={{ color: COLORS.deepBlue }}>
                Filter by:
              </span>
            </div>
            
            <div className="flex flex-wrap gap-4 flex-1 justify-end">
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger 
                  className="w-full md:w-56 h-11 border-2"
                  style={{ borderColor: COLORS.offWhite }}
                >
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Array.isArray(categories) && categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Difficulty Filter */}
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger 
                  className="w-full md:w-56 h-11 border-2"
                  style={{ borderColor: COLORS.offWhite }}
                >
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(categoryFilter !== "all" || difficultyFilter !== "all" || search) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setCategoryFilter("all");
                    setDifficultyFilter("all");
                  }}
                  className="h-11"
                  style={{ borderColor: COLORS.deepBlue, color: COLORS.deepBlue }}
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {(categoryFilter !== "all" || difficultyFilter !== "all" || search) && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm" style={{ color: COLORS.darkGrey }}>Active filters:</span>
              {search && (
                <Badge 
                  className="text-white"
                  style={{ backgroundColor: COLORS.skyBlue }}
                >
                  Search: "{search}"
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge 
                  className="text-white"
                  style={{ backgroundColor: COLORS.skyBlue }}
                >
                  {categories?.find((c: any) => c.id.toString() === categoryFilter)?.name}
                </Badge>
              )}
              {difficultyFilter !== "all" && (
                <Badge 
                  className="text-white"
                  style={{ backgroundColor: COLORS.skyBlue }}
                >
                  {difficultyFilter.charAt(0).toUpperCase() + difficultyFilter.slice(1)}
                </Badge>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {/* Results Count */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>
                Available Courses
              </h2>
              <p className="text-sm mt-1" style={{ color: COLORS.darkGrey }}>
                {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Popular Categories Quick Filter */}
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm" style={{ color: COLORS.darkGrey }}>Popular:</span>
              {Array.isArray(categories) && categories.slice(0, 3).map((category: any) => (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id.toString())}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    categoryFilter === category.id.toString()
                      ? 'text-white shadow-md'
                      : 'hover:shadow-sm'
                  }`}
                  style={{
                    backgroundColor: categoryFilter === category.id.toString() 
                      ? COLORS.skyBlue 
                      : COLORS.offWhite,
                    color: categoryFilter === category.id.toString() 
                      ? 'white' 
                      : COLORS.darkGrey
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course: any) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto bg-white rounded-2xl p-12 shadow-lg">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                  style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                >
                  <Search className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                </div>
                <h3 className="text-2xl font-bold mb-3" style={{ color: COLORS.deepBlue }}>
                  No Courses Found
                </h3>
                <p className="mb-6" style={{ color: COLORS.darkGrey }}>
                  We couldn't find any courses matching your criteria. Try adjusting your filters or search terms.
                </p>
                <Button 
                  onClick={() => { 
                    setSearch(""); 
                    setCategoryFilter("all"); 
                    setDifficultyFilter("all");
                  }}
                  className="text-white font-semibold"
                  style={{ backgroundColor: COLORS.skyBlue }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Our Courses Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>
              Why Choose Our Courses?
            </h2>
            <p className="text-lg" style={{ color: COLORS.darkGrey }}>
              Get the competitive edge with our expert-led programs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: GraduationCap,
                title: "Expert Instructors",
                description: "Learn from certified professionals with 10+ years of experience"
              },
              {
                icon: Award,
                title: "Proven Results",
                description: "98% of our students achieve their target scores"
              },
              {
                icon: TrendingUp,
                title: "Personalized Learning",
                description: "Customized study plans tailored to your goals and pace"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl text-center hover:shadow-lg transition-shadow"
                style={{ backgroundColor: COLORS.offWhite }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                >
                  <feature.icon className="h-8 w-8" style={{ color: COLORS.skyBlue }} />
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                  {feature.title}
                </h3>
                <p style={{ color: COLORS.darkGrey }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-[#1C4E9C] to-[#2A7CCD] text-white">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 15,000+ students who achieved their dreams with our expert guidance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              className="h-12 px-8 text-white font-semibold shadow-xl"
              style={{ backgroundColor: COLORS.skyBlue }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
            >
              Book Free Consultation
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
              View Free Courses
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
