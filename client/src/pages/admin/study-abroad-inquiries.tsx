import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StudyAbroadInquiry } from "../../../../shared/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Edit, 
  Trash2, 
  Search,
  MoreHorizontal,
  Eye,
  MessageSquare,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  GraduationCap,
  Building,
  Clock,
  Star,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminStudyAbroadInquiries() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [selectedInquiry, setSelectedInquiry] = useState<StudyAbroadInquiry | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ["/api/study-abroad-inquiries", { status: statusFilter, priority: priorityFilter }],
    queryFn: async (): Promise<StudyAbroadInquiry[]> => {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (priorityFilter) params.append("priority", priorityFilter);
      
      const response = await fetch(`/api/study-abroad-inquiries?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.json();
    },
  });

  const updateInquiryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StudyAbroadInquiry> }) => {
      const response = await fetch(`/api/study-abroad-inquiries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update inquiry");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-abroad-inquiries"] });
      toast({ title: "Inquiry updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update inquiry", variant: "destructive" });
    },
  });

  const deleteInquiryMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/study-abroad-inquiries/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (!response.ok) throw new Error("Failed to delete inquiry");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/study-abroad-inquiries"] });
      toast({ title: "Inquiry deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete inquiry", variant: "destructive" });
    },
  });

  const filteredInquiries = inquiries.filter((inquiry: StudyAbroadInquiry) => {
    const matchesSearch = !searchTerm || 
      inquiry.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.phone.includes(searchTerm);
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800";
      case "contacted": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-purple-100 text-purple-800";
      case "completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <AlertCircle className="h-3 w-3" />;
      case "medium": return <Clock className="h-3 w-3" />;
      case "low": return <CheckCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleDeleteInquiry = (inquiry: StudyAbroadInquiry) => {
    if (window.confirm(`Are you sure you want to delete the inquiry from ${inquiry.fullName}?`)) {
      deleteInquiryMutation.mutate(inquiry.id || "");
    }
  };

  const handleStatusChange = (inquiry: StudyAbroadInquiry, newStatus: string) => {
    updateInquiryMutation.mutate({
      id: inquiry.id || "",
      data: { status: newStatus as any }
    });
  };

  const handlePriorityChange = (inquiry: StudyAbroadInquiry, newPriority: string) => {
    updateInquiryMutation.mutate({
      id: inquiry.id || "",
      data: { priority: newPriority as any }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Study Abroad Inquiries</h2>
          <p className="text-muted-foreground">
            Manage and track study abroad service inquiries
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-sm">
            Total: {inquiries.length}
          </Badge>
          <Badge variant="outline" className="text-sm">
            New: {inquiries.filter((i: StudyAbroadInquiry) => i.status === "new").length}
          </Badge>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search inquiries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inquiries ({filteredInquiries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contact</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredInquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-gray-500">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                        <p>No inquiries found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInquiries.map((inquiry: StudyAbroadInquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div>
                            <div className="font-medium">{inquiry.fullName}</div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {inquiry.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {inquiry.phone}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{(inquiry as any).service?.title || "N/A"}</div>
                          <div className="text-gray-500">{(inquiry as any).service?.serviceType || ""}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Badge className={getStatusColor(inquiry.status)}>
                                {inquiry.status.replace("_", " ")}
                              </Badge>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleStatusChange(inquiry, "new")}>
                              New
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(inquiry, "contacted")}>
                              Contacted
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(inquiry, "in_progress")}>
                              In Progress
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(inquiry, "completed")}>
                              Completed
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Badge className={getPriorityColor(inquiry.priority)} variant="outline">
                                {getPriorityIcon(inquiry.priority)}
                                <span className="ml-1">{inquiry.priority}</span>
                              </Badge>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handlePriorityChange(inquiry, "low")}>
                              Low
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePriorityChange(inquiry, "medium")}>
                              Medium
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePriorityChange(inquiry, "high")}>
                              High
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {new Date((inquiry as any).createdAt || Date.now()).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedInquiry(inquiry);
                                setIsDetailDialogOpen(true);
                              }}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedInquiry(inquiry);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteInquiry(inquiry)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <InquiryDetail inquiry={selectedInquiry} />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Inquiry</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <InquiryEditForm 
              inquiry={selectedInquiry}
              onSuccess={() => {
                setIsEditDialogOpen(false);
                setSelectedInquiry(null);
                queryClient.invalidateQueries({ queryKey: ["/api/study-abroad-inquiries"] });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InquiryDetail({ inquiry }: { inquiry: StudyAbroadInquiry }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-2">Contact Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span>{inquiry.fullName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{inquiry.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span>{inquiry.phone}</span>
            </div>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Study Details</h4>
          <div className="space-y-2 text-sm">
            {inquiry.country && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span>{inquiry.country}</span>
              </div>
            )}
            {inquiry.course && (
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-gray-500" />
                <span>{inquiry.course}</span>
              </div>
            )}
            {inquiry.university && (
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <span>{inquiry.university}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          {inquiry.budget && (
            <div>
              <h4 className="font-semibold mb-2">Budget</h4>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>{inquiry.budget}</span>
              </div>
            </div>
          )}
        </div>
        <div>
          {inquiry.timeline && (
            <div>
              <h4 className="font-semibold mb-2">Timeline</h4>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{inquiry.timeline}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {inquiry.message && (
        <div>
          <h4 className="font-semibold mb-2">Message</h4>
          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
            {inquiry.message}
          </p>
        </div>
      )}

      {inquiry.notes && (
        <div>
          <h4 className="font-semibold mb-2">Internal Notes</h4>
          <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-md">
            {inquiry.notes}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Badge className={`${inquiry.status === 'new' ? 'bg-blue-100 text-blue-800' : inquiry.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' : inquiry.status === 'in_progress' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
          {inquiry.status.replace("_", " ")}
        </Badge>
        <Badge variant="outline" className={`${inquiry.priority === 'high' ? 'bg-red-100 text-red-800' : inquiry.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
          {inquiry.priority} priority
        </Badge>
      </div>
    </div>
  );
}

function InquiryEditForm({ inquiry, onSuccess }: { inquiry: StudyAbroadInquiry; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    status: inquiry.status,
    priority: inquiry.priority,
    notes: inquiry.notes || "",
    assignedTo: inquiry.assignedTo || "",
  });

  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/study-abroad-inquiries/${inquiry.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update inquiry");

      toast({
        title: "Inquiry updated successfully",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update inquiry",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value as any})}
            className="w-full p-2 border rounded-md"
          >
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div>
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
            className="w-full p-2 border rounded-md"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Internal Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
          rows={4}
          placeholder="Add internal notes for team reference..."
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Updating..." : "Update Inquiry"}
      </Button>
    </form>
  );
}
