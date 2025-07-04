import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import EventCard from "@/components/event-card";
import FlyingPlaneLoader from "@/components/flying-plane-loader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Filter, MapPin, Clock } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <Header />
        <div className="container py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <FlyingPlaneLoader 
              size="lg" 
              message="Finding exciting events for you..." 
              className="sky-background p-12 rounded-2xl"
            />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Header />
      
      {/* Modern Page Header */}
      <section className="relative py-24 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-emerald-600/10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(120,119,198,0.3),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(34,197,94,0.2),transparent_50%)]"></div>
        
        <div className="container relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-blue-700 font-medium mb-6">
              <Calendar className="h-4 w-4 mr-2" />
              Learning Events
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-600 bg-clip-text text-transparent mb-6">
              Events & Seminars
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join our educational events, workshops, and study abroad fairs to enhance your knowledge and network with experts.
            </p>
          </div>

          {/* Featured Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center glass-card rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{Array.isArray(upcomingEvents) ? upcomingEvents.length : 0}</h3>
              <p className="text-gray-600">Upcoming Events</p>
            </div>
            <div className="text-center glass-card rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 p-4 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">12</h3>
              <p className="text-gray-600">Venues Available</p>
            </div>
            <div className="text-center glass-card rounded-2xl p-8 hover:shadow-xl transition-all">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 p-4 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">5000+</h3>
              <p className="text-gray-600">Attendees This Year</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-20">
        <Tabs defaultValue="upcoming" className="space-y-12">
          <div className="text-center mb-12">
            <TabsList className="glass-card rounded-full p-2 h-auto shadow-lg border-0">
              <TabsTrigger value="upcoming" className="rounded-full px-8 py-3 text-sm font-medium">
                Upcoming Events
              </TabsTrigger>
              <TabsTrigger value="all" className="rounded-full px-8 py-3 text-sm font-medium">
                All Events
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="upcoming" className="space-y-8">
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
                          className="modern-button"
                        >
                          {registerMutation.isPending ? "Registering..." : "Register Now"}
                        </Button>
                      ) : (
                        <Button asChild className="modern-button">
                          <a href="/login">Login to Register</a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <div className="glass-card rounded-2xl p-12 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No upcoming events</h3>
                    <p className="text-gray-600 leading-relaxed">Check back later for new events and seminars.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-8">
            {/* Modern Filters */}
            <div className="flex justify-center">
              <div className="glass-card rounded-2xl p-6 shadow-lg border-0">
                <div className="flex items-center space-x-4">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                    <SelectTrigger className="w-48 border-0 bg-white/80 focus:bg-white rounded-xl">
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
                </div>
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
                          className="modern-button"
                        >
                          {registerMutation.isPending ? "Registering..." : "Register Now"}
                        </Button>
                      ) : (
                        <Button asChild className="modern-button">
                          <a href="/login">Login to Register</a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <div className="glass-card rounded-2xl p-12 max-w-md mx-auto">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No events found</h3>
                    <p className="text-gray-600 leading-relaxed">Try adjusting your filters or check back later.</p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
