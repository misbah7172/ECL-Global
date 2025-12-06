import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import EventCard from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Filter, MapPin, Clock, Users, TrendingUp, Award, ChevronRight, BookOpen } from "lucide-react";

// ECL Global Color Palette
const COLORS = {
  deepBlue: '#1C4E9C',
  skyBlue: '#33A9D9',
  midBlue: '#2A7CCD',
  darkGrey: '#4F4F4F',
  offWhite: '#F8F8F8',
};

export default function Events() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedEventType, setSelectedEventType] = useState("all");

  const { data: upcomingEvents, isLoading: upcomingLoading } = useQuery({
    queryKey: ["/api/events", { upcoming: true }],
    queryFn: async () => {
      const response = await fetch("/api/events?upcoming=true");
      return response.json();
    },
  });

  const { data: allEvents, isLoading: allLoading } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const response = await fetch("/api/events");
      return response.json();
    },
  });

  const registerMutation = useMutation({
    mutationFn: (eventId: number) => apiRequest("POST", `/api/events/${eventId}/register`),
    onSuccess: () => {
      toast({
        title: "Registration Successful!",
        description: "You have been registered for this event.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    },
  });

  const eventTypes = ["seminar", "workshop", "fair", "webinar"];

  const filteredEvents = selectedEventType && selectedEventType !== "all"
    ? allEvents?.filter((event: any) => event.eventType === selectedEventType)
    : allEvents;

  const isLoading = upcomingLoading || allLoading;

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
                <Calendar className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2" style={{ color: COLORS.deepBlue }}>
                Loading Events
              </h3>
              <p style={{ color: COLORS.darkGrey }}>Finding exciting events for you...</p>
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
        className="relative py-24 text-white overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 50%, ${COLORS.skyBlue} 100%)`
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-40 h-40 border-4 border-white rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-32 h-32 border-4 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 border-4 border-white rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <div 
              className="inline-flex items-center px-6 py-3 rounded-full mb-6 backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <Calendar className="h-5 w-5 mr-2" />
              <span className="font-semibold">Learning Events & Seminars</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Events & Workshops
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Join our educational events, workshops, and study abroad fairs to enhance your knowledge and network with industry experts.
            </p>
          </div>

          {/* Featured Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div 
              className="text-center p-8 rounded-2xl backdrop-blur-sm hover:shadow-2xl transition-all"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
              >
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">{Array.isArray(upcomingEvents) ? upcomingEvents.length : 0}</h3>
              <p className="text-blue-100 font-medium">Upcoming Events</p>
            </div>
            <div 
              className="text-center p-8 rounded-2xl backdrop-blur-sm hover:shadow-2xl transition-all"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
              >
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">12+</h3>
              <p className="text-blue-100 font-medium">Venues Available</p>
            </div>
            <div 
              className="text-center p-8 rounded-2xl backdrop-blur-sm hover:shadow-2xl transition-all"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
            >
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
              >
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-2">5,000+</h3>
              <p className="text-blue-100 font-medium">Attendees This Year</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-6xl py-20">
        <Tabs defaultValue="upcoming" className="space-y-12">
          <div className="text-center mb-12">
            <TabsList 
              className="rounded-full p-2 h-auto shadow-lg border-0"
              style={{ backgroundColor: COLORS.offWhite }}
            >
              <TabsTrigger 
                value="upcoming" 
                className="rounded-full px-8 py-3 text-sm font-semibold data-[state=active]:text-white"
                style={{
                  backgroundColor: 'transparent',
                }}
              >
                Upcoming Events
              </TabsTrigger>
              <TabsTrigger 
                value="all" 
                className="rounded-full px-8 py-3 text-sm font-semibold data-[state=active]:text-white"
                style={{
                  backgroundColor: 'transparent',
                }}
              >
                All Events
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upcoming" className="space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>Upcoming Events</h2>
              <p style={{ color: COLORS.darkGrey }}>Don't miss these exciting upcoming events and workshops</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Array.isArray(upcomingEvents) && upcomingEvents.length > 0 ? (
                upcomingEvents.map((event: any) => (
                  <div key={event.id} className="relative">
                    <EventCard event={event} />
                    <div className="absolute bottom-4 right-4">
                      {isAuthenticated ? (
                        <Button 
                          onClick={() => registerMutation.mutate(event.id)}
                          disabled={registerMutation.isPending}
                          className="text-white font-semibold shadow-lg"
                          style={{ backgroundColor: COLORS.skyBlue }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                        >
                          {registerMutation.isPending ? "Registering..." : "Register Now"}
                        </Button>
                      ) : (
                        <Button 
                          asChild
                          className="text-white font-semibold shadow-lg"
                          style={{ backgroundColor: COLORS.skyBlue }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                        >
                          <a href="/login">Login to Register</a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <div className="max-w-md mx-auto bg-white rounded-2xl p-12 shadow-lg">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                      style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                    >
                      <Calendar className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3" style={{ color: COLORS.deepBlue }}>No Upcoming Events</h3>
                    <p style={{ color: COLORS.darkGrey }}>Check back later for new events and seminars.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-8">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-white rounded-xl shadow-sm">
              <div>
                <h2 className="text-2xl font-bold" style={{ color: COLORS.deepBlue }}>All Events</h2>
                <p style={{ color: COLORS.darkGrey }}>Browse our complete event catalog</p>
              </div>
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5" style={{ color: COLORS.darkGrey }} />
                <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                  <SelectTrigger 
                    className="w-56 h-12 border-2 rounded-xl font-medium"
                    style={{ borderColor: COLORS.skyBlue, color: COLORS.deepBlue }}
                  >
                    <SelectValue placeholder="All Event Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Event Types</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedEventType !== 'all' && (
                  <Badge 
                    variant="secondary"
                    className="px-3 py-1 cursor-pointer"
                    style={{ backgroundColor: `${COLORS.skyBlue}20`, color: COLORS.deepBlue }}
                    onClick={() => setSelectedEventType('all')}
                  >
                    {selectedEventType} ✕
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Array.isArray(filteredEvents) && filteredEvents.length > 0 ? (
                filteredEvents.map((event: any) => (
                  <div key={event.id} className="relative">
                    <EventCard event={event} />
                    <div className="absolute bottom-4 right-4">
                      {isAuthenticated ? (
                        <Button 
                          onClick={() => registerMutation.mutate(event.id)}
                          disabled={registerMutation.isPending}
                          className="text-white font-semibold shadow-lg"
                          style={{ backgroundColor: COLORS.skyBlue }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                        >
                          {registerMutation.isPending ? "Registering..." : "Register Now"}
                        </Button>
                      ) : (
                        <Button 
                          asChild
                          className="text-white font-semibold shadow-lg"
                          style={{ backgroundColor: COLORS.skyBlue }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                        >
                          <a href="/login">Login to Register</a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <div className="max-w-md mx-auto bg-white rounded-2xl p-12 shadow-lg">
                    <div 
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                      style={{ backgroundColor: `${COLORS.skyBlue}20` }}
                    >
                      <Calendar className="h-10 w-10" style={{ color: COLORS.skyBlue }} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3" style={{ color: COLORS.deepBlue }}>No Events Found</h3>
                    <p className="mb-6" style={{ color: COLORS.darkGrey }}>Try adjusting your filters or check back later.</p>
                    <Button
                      onClick={() => setSelectedEventType('all')}
                      className="text-white font-semibold"
                      style={{ backgroundColor: COLORS.skyBlue }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: COLORS.deepBlue }}>
              Why Attend Our Events?
            </h2>
            <p className="text-lg" style={{ color: COLORS.darkGrey }}>
              Get the most out of your learning journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Network with Experts",
                description: "Connect with industry professionals, university representatives, and fellow students pursuing similar goals."
              },
              {
                icon: BookOpen,
                title: "Gain Valuable Insights",
                description: "Learn from expert speakers about study abroad opportunities, exam strategies, and career pathways."
              },
              {
                icon: Award,
                title: "Interactive Sessions",
                description: "Participate in workshops, Q&A sessions, and hands-on activities designed to enhance your skills."
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
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20 text-white"
        style={{
          background: `linear-gradient(135deg, ${COLORS.deepBlue} 0%, ${COLORS.midBlue} 100%)`
        }}
      >
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <Calendar className="h-16 w-16 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Don't Miss Our Next Event!
          </h2>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Register now for upcoming events and take the next step in your educational journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              className="h-14 px-8 text-white font-semibold shadow-xl"
              style={{ backgroundColor: COLORS.skyBlue }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = COLORS.midBlue}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = COLORS.skyBlue}
            >
              View Upcoming Events
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="h-14 px-8 border-2 border-white text-white hover:bg-white font-semibold"
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.color = COLORS.deepBlue;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'white';
              }}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
