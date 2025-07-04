import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, FileText, Play, Lock } from "lucide-react";

interface MockTestCardProps {
  test: {
    id: number;
    title: string;
    description: string;
    testType: string;
    duration: number;
    totalQuestions: number;
  };
  onStart: () => void;
  isStarting: boolean;
  isAuthenticated: boolean;
}

export default function MockTestCard({ test, onStart, isStarting, isAuthenticated }: MockTestCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="secondary">{test.testType}</Badge>
          <div className="flex items-center text-gray-500 text-sm">
            <FileText className="h-4 w-4 mr-1" />
            {test.totalQuestions} questions
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{test.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{test.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Clock className="h-4 w-4 mr-1" />
          <span>{test.duration} minutes</span>
        </div>
        
        {isAuthenticated ? (
          <Button 
            className="w-full" 
            onClick={onStart}
            disabled={isStarting}
          >
            {isStarting ? (
              "Starting..."
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Test
              </>
            )}
          </Button>
        ) : (
          <Button className="w-full" variant="outline" disabled>
            <Lock className="h-4 w-4 mr-2" />
            Login to Start
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
