import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Globe, MessageSquare, Phone, Mail, User, MapPin, GraduationCap, DollarSign, Calendar } from "lucide-react";

interface StudyAbroadInquiryFormProps {
  serviceId?: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function StudyAbroadInquiryForm({ 
  serviceId, 
  trigger, 
  onSuccess 
}: StudyAbroadInquiryFormProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    course: "",
    university: "",
    budget: "",
    timeline: "",
    message: "",
    serviceId: serviceId || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/study-abroad-inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit inquiry");

      toast({
        title: "Inquiry Submitted Successfully!",
        description: "Our team will contact you within 24 hours.",
      });

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        country: "",
        course: "",
        university: "",
        budget: "",
        timeline: "",
        message: "",
        serviceId: serviceId || ""
      });

      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Full Name *
          </Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            required
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
            placeholder="Enter your email"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Phone Number *
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            required
            placeholder="Enter your phone number"
          />
        </div>
        <div>
          <Label htmlFor="country" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Preferred Country
          </Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
            placeholder="e.g., USA, Canada, UK"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="course" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Course/Field of Study
          </Label>
          <Input
            id="course"
            value={formData.course}
            onChange={(e) => setFormData({...formData, course: e.target.value})}
            placeholder="e.g., Computer Science, Business"
          />
        </div>
        <div>
          <Label htmlFor="university" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Target University
          </Label>
          <Input
            id="university"
            value={formData.university}
            onChange={(e) => setFormData({...formData, university: e.target.value})}
            placeholder="e.g., Harvard, MIT, Oxford"
          />
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="budget" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Budget Range
          </Label>
          <Input
            id="budget"
            value={formData.budget}
            onChange={(e) => setFormData({...formData, budget: e.target.value})}
            placeholder="e.g., $20,000 - $50,000"
          />
        </div>
        <div>
          <Label htmlFor="timeline" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Timeline
          </Label>
          <Input
            id="timeline"
            value={formData.timeline}
            onChange={(e) => setFormData({...formData, timeline: e.target.value})}
            placeholder="e.g., Fall 2024, Spring 2025"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="message" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Additional Message
        </Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          rows={4}
          placeholder="Tell us more about your study abroad goals, academic background, or any specific questions you have..."
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Inquiry"}
      </Button>
    </form>
  );

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Study Abroad Inquiry
            </DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Study Abroad Inquiry
        </CardTitle>
      </CardHeader>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
}
