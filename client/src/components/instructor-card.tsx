import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface InstructorCardProps {
  instructor: {
    id: number;
    name: string;
    specialization: string;
    experience: string;
    rating: string;
    achievement: string;
    imageUrl: string;
  };
}

export default function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <div className="text-center instructor-card">
      <img 
        src={instructor.imageUrl} 
        alt={instructor.name} 
        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-gray-200 hover:border-primary/30 transition-colors"
      />
      <h3 className="text-xl font-semibold text-gray-900 mb-1">{instructor.name}</h3>
      <p className="text-primary font-medium mb-2">{instructor.specialization}</p>
      <p className="text-sm text-gray-600 mb-3">{instructor.experience}</p>
      <div className="flex justify-center items-center text-yellow-400 mb-2">
        <Star className="h-4 w-4 fill-current" />
        <span className="text-gray-600 text-sm ml-1">{instructor.rating}</span>
      </div>
      <p className="text-sm text-gray-500">{instructor.achievement}</p>
    </div>
  );
}
