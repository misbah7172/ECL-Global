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
      <div className="min-h-screen">
        <Header />
        <div className="container py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <section className="bg-white py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Events & Seminars</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Join our educational events, workshops, and study abroad fairs to enhance your knowledge and network with experts.
            </p>
          </div>

          {/* Featured Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{upcomingEvents?.length || 0}</h3>
              <p className="text-gray-600">Upcoming Events</p>
            </div>
            <div className="text-center">
              <div className="bg-secondary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MapPin className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">12</h3>
              <p className="text-gray-600">Venues Available</p>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">5000+</h3>
              <p className="text-gray-600">Attendees This Year</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-16">
        <Tabs defaultValue="upcoming" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="all">All Events</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {upcomingEvents && upcomingEvents.length > 0 ? (
                upcomingEvents.map((event: any) => (
                  <div key={event.id} className="relative">
                    <EventCard event={event} />
                    <div className="absolute bottom-4 right-4">
                      {isAuthenticated ? (
                        <Button 
                          onClick={() => registerMutation.mutate(event.id)}
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? "Registering..." : "Register Now"}
                        </Button>
                      ) : (
                        <Button asChild>
                          <a href="/login">Login to Register</a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming events</h3>
                  <p className="text-gray-600">Check back later for new events and seminars.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-8">
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger className="w-48">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredEvents && filteredEvents.length > 0 ? (
                filteredEvents.map((event: any) => (
                  <div key={event.id} className="relative">
                    <EventCard event={event} />
                    <div className="absolute bottom-4 right-4">
                      {isAuthenticated ? (
                        <Button 
                          onClick={() => registerMutation.mutate(event.id)}
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? "Registering..." : "Register Now"}
                        </Button>
                      ) : (
                        <Button asChild>
                          <a href="/login">Login to Register</a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
                  <p className="text-gray-600">Try adjusting your filters or check back later.</p>
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
