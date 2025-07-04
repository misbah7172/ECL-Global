import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock } from "lucide-react";

interface EventCardProps {
  event: {
    id: number;
    title: string;
    description: string;
    eventType: string;
    eventDate: string;
    venue: string;
    price: string;
    isOnline: boolean;
    imageUrl?: string;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.eventDate);
  
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <img 
        src={event.imageUrl || "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=300&fit=crop"} 
        alt={event.title} 
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary">{event.eventType.toUpperCase()}</Badge>
          <span className="text-sm text-gray-500">
            {eventDate.toLocaleDateString()}
          </span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{eventDate.toLocaleDateString()} • {eventDate.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            {event.isOnline ? (
              <>
                <Clock className="h-4 w-4 mr-2" />
                <span>Online Event</span>
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                <span>{event.venue}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium text-primary">{event.price === "0" ? "Free" : `৳${event.price}`}</span>
            {event.isOnline && " • Online event"}
          </div>
          <Button>Register Now</Button>
        </div>
      </CardContent>
    </Card>
  );
}
