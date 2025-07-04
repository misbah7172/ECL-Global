import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Redirect } from "wouter";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Edit, Eye, Search, MessageSquare, Phone, Mail, Calendar, User, Clock, Filter, Download, MoreHorizontal, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function AdminLeads() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [interestFilter, setInterestFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  if (!isAdmin) {
    return <Redirect to="/dashboard" />;
  }

  const { data: leads, isLoading } = useQuery({
    queryKey: ["/api/leads", { search, status: statusFilter, interest: interestFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (interestFilter !== "all") params.append("interest", interestFilter);
      
      const url = `/api/leads${params.toString() ? `?${params.toString()}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) return [];
      return response.json();
    },
  });

  const updateLeadStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      apiRequest("PATCH", `/api/leads/${id}`, { status }),
    onSuccess: () => {
      toast({
        title: "Lead Updated",
        description: "Lead status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update lead status",
        variant: "destructive",
      });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/leads/${id}`),
    onSuccess: () => {
      toast({
        title: "Lead Deleted",
        description: "Lead has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete lead",
        variant: "destructive",
      });
    },
  });

  // Sample lead data for demo
  const sampleLeads = [
    {
      id: 1,
      fullName: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      phone: "+1234567890",
      interest: "IELTS Preparation",
      status: "new",
      message: "I'm interested in IELTS preparation course. Please contact me.",
      preferredContactTime: "Morning",
      source: "Website Form",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      assignedTo: null,
      notes: []
    },
    {
      id: 2,
      fullName: "Ahmed Hassan",
      email: "ahmed.hassan@example.com",
      phone: "+1987654321",
      interest: "SAT Preparation",
      status: "contacted",
      message: "Looking for SAT prep courses starting next month.",
      preferredContactTime: "Evening",
      source: "Google Ads",
      createdAt: "2024-01-14T14:20:00Z",
      updatedAt: "2024-01-15T09:15:00Z",
      assignedTo: "John Doe",
      notes: [
        { text: "Called and discussed course options", date: "2024-01-15T09:15:00Z" }
      ]
    },
    {
      id: 3,
      fullName: "Maria Rodriguez",
      email: "maria.rodriguez@example.com",
      phone: "+1122334455",
      interest: "Study Abroad Counseling",
      status: "qualified",
      message: "Need help with university applications for Canada.",
      preferredContactTime: "Afternoon",
      source: "Facebook",
      createdAt: "2024-01-13T16:45:00Z",
      updatedAt: "2024-01-14T11:30:00Z",
      assignedTo: "Jane Smith",
      notes: [
        { text: "Interested in Canadian universities", date: "2024-01-14T11:30:00Z" },
        { text: "Scheduled consultation call", date: "2024-01-14T11:35:00Z" }
      ]
    },
    {
      id: 4,
      fullName: "David Kim",
      email: "david.kim@example.com",
      phone: "+1555666777",
      interest: "TOEFL Preparation",
      status: "converted",
      message: "Want to enroll in TOEFL intensive course.",
      preferredContactTime: "Morning",
      source: "Referral",
      createdAt: "2024-01-12T09:00:00Z",
      updatedAt: "2024-01-13T15:20:00Z",
      assignedTo: "John Doe",
      notes: [
        { text: "Enrolled in TOEFL Intensive course", date: "2024-01-13T15:20:00Z" }
      ]
    }
  ];

  const displayLeads = leads || sampleLeads;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800";
      case "contacted":
        return "bg-yellow-100 text-yellow-800";
      case "qualified":
        return "bg-green-100 text-green-800";
      case "converted":
        return "bg-purple-100 text-purple-800";
      case "lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="h-4 w-4" />;
      case "contacted":
        return <Phone className="h-4 w-4" />;
      case "qualified":
        return <CheckCircle className="h-4 w-4" />;
      case "converted":
        return <CheckCircle className="h-4 w-4" />;
      case "lost":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusChange = (leadId: number, newStatus: string) => {
    updateLeadStatusMutation.mutate({ id: leadId, status: newStatus });
  };

  const handleViewDetails = (lead: any) => {
    setSelectedLead(lead);
    setIsDetailModalOpen(true);
  };

  const exportLeads = () => {
    // Create CSV content
    const csvContent = [
      ["Name", "Email", "Phone", "Interest", "Status", "Source", "Created At"].join(","),
      ...displayLeads.map((lead: any) => [
        lead.fullName,
        lead.email,
        lead.phone,
        lead.interest,
        lead.status,
        lead.source,
        new Date(lead.createdAt).toLocaleDateString()
      ].join(","))
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <AdminLayout title="Leads Management">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  const stats = {
    total: displayLeads.length,
    new: displayLeads.filter((lead: any) => lead.status === "new").length,
    contacted: displayLeads.filter((lead: any) => lead.status === "contacted").length,
    qualified: displayLeads.filter((lead: any) => lead.status === "qualified").length,
    converted: displayLeads.filter((lead: any) => lead.status === "converted").length,
    conversionRate: ((displayLeads.filter((lead: any) => lead.status === "converted").length / displayLeads.length) * 100).toFixed(1)
  };

  return (
    <AdminLayout title="Leads Management">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leads Management</h1>
            <p className="text-gray-600 mt-1">Track and manage incoming leads</p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={exportLeads}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/leads"] })}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-gray-600 text-sm">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-yellow-100 p-3 rounded-lg mr-4">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.new}</p>
                <p className="text-gray-600 text-sm">New</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg mr-4">
                <Phone className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.contacted}</p>
                <p className="text-gray-600 text-sm">Contacted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.qualified}</p>
                <p className="text-gray-600 text-sm">Qualified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.converted}</p>
                <p className="text-gray-600 text-sm">Converted</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                <RefreshCw className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate}%</p>
                <p className="text-gray-600 text-sm">Conversion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>

          <Select value={interestFilter} onValueChange={setInterestFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by interest" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Interests</SelectItem>
              <SelectItem value="IELTS Preparation">IELTS Preparation</SelectItem>
              <SelectItem value="SAT Preparation">SAT Preparation</SelectItem>
              <SelectItem value="TOEFL Preparation">TOEFL Preparation</SelectItem>
              <SelectItem value="Study Abroad Counseling">Study Abroad Counseling</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayLeads.map((lead: any) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{lead.fullName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 text-sm">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{lead.email}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{lead.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{lead.interest}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(lead.status)}>
                      {getStatusIcon(lead.status)}
                      <span className="ml-1 capitalize">{lead.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">{lead.source}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {lead.assignedTo || "Unassigned"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(lead)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(lead.id, "contacted")}>
                          <Phone className="h-4 w-4 mr-2" />
                          Mark as Contacted
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(lead.id, "qualified")}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Qualified
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(lead.id, "converted")}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Converted
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteLeadMutation.mutate(lead.id)}
                          className="text-red-600"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lead Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {selectedLead.fullName}</p>
                    <p><strong>Email:</strong> {selectedLead.email}</p>
                    <p><strong>Phone:</strong> {selectedLead.phone}</p>
                    <p><strong>Preferred Contact:</strong> {selectedLead.preferredContactTime}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Lead Information</h3>
                  <div className="space-y-2">
                    <p><strong>Interest:</strong> {selectedLead.interest}</p>
                    <p><strong>Status:</strong> 
                      <Badge className={`ml-2 ${getStatusColor(selectedLead.status)}`}>
                        {selectedLead.status}
                      </Badge>
                    </p>
                    <p><strong>Source:</strong> {selectedLead.source}</p>
                    <p><strong>Assigned To:</strong> {selectedLead.assignedTo || "Unassigned"}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Message</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedLead.message}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Notes</h3>
                {selectedLead.notes && selectedLead.notes.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLead.notes.map((note: any, index: number) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-gray-700">{note.text}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(note.date).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No notes available</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
