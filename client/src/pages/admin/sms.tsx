import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Phone, Plus, Send, Trash2, Search, Filter, MessageSquare, Users, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Eye, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type SMSStatus = "pending" | "sent" | "delivered" | "failed";
type SMSType = "promotional" | "transactional" | "reminder" | "notification";
type SMSTarget = "all" | "students" | "instructors" | "parents" | "custom";

type SMSMessage = {
  id: string;
  message: string;
  recipients: string[];
  recipientCount: number;
  type: SMSType;
  target: SMSTarget;
  status: SMSStatus;
  scheduledAt?: string;
  sentAt?: string;
  deliveredCount: number;
  failedCount: number;
  createdAt: string;
  createdBy: string;
  cost: number;
  campaign?: string;
  template?: string;
};

type SMSTemplate = {
  id: string;
  name: string;
  content: string;
  type: SMSType;
  variables: string[];
  isActive: boolean;
  usageCount: number;
  createdAt: string;
};

const mockSMSMessages: SMSMessage[] = [
  {
    id: "1",
    message: "Welcome to Mentor! Your enrollment in Advanced JavaScript has been confirmed. Classes start Monday at 9 AM. Good luck!",
    recipients: ["+1234567890", "+1234567891", "+1234567892"],
    recipientCount: 3,
    type: "transactional",
    target: "students",
    status: "delivered",
    sentAt: "2024-01-15T09:00:00Z",
    deliveredCount: 3,
    failedCount: 0,
    createdAt: "2024-01-15T08:30:00Z",
    createdBy: "Admin",
    cost: 0.15,
    campaign: "Enrollment Confirmation"
  },
  {
    id: "2",
    message: "⏰ Reminder: Your React course exam is scheduled for tomorrow at 2 PM. Please be prepared with your materials.",
    recipients: ["+1234567890", "+1234567891", "+1234567892", "+1234567893"],
    recipientCount: 4,
    type: "reminder",
    target: "students",
    status: "sent",
    sentAt: "2024-01-14T16:00:00Z",
    deliveredCount: 3,
    failedCount: 1,
    createdAt: "2024-01-14T15:30:00Z",
    createdBy: "Course Manager",
    cost: 0.20,
    campaign: "Exam Reminders"
  },
  {
    id: "3",
    message: "🚀 New course alert! Advanced Machine Learning is now available. Early bird discount: 20% off until Friday!",
    recipients: ["+1234567890", "+1234567891", "+1234567892", "+1234567893", "+1234567894"],
    recipientCount: 5,
    type: "promotional",
    target: "all",
    status: "pending",
    scheduledAt: "2024-01-16T10:00:00Z",
    deliveredCount: 0,
    failedCount: 0,
    createdAt: "2024-01-15T14:20:00Z",
    createdBy: "Marketing",
    cost: 0.25,
    campaign: "New Course Launch"
  }
];

const mockSMSTemplates: SMSTemplate[] = [
  {
    id: "1",
    name: "Course Enrollment",
    content: "Welcome to Mentor! Your enrollment in {course_name} has been confirmed. Classes start {start_date}. Good luck!",
    type: "transactional",
    variables: ["course_name", "start_date"],
    isActive: true,
    usageCount: 25,
    createdAt: "2024-01-01T10:00:00Z"
  },
  {
    id: "2",
    name: "Exam Reminder",
    content: "⏰ Reminder: Your {course_name} exam is scheduled for {exam_date}. Please be prepared with your materials.",
    type: "reminder",
    variables: ["course_name", "exam_date"],
    isActive: true,
    usageCount: 15,
    createdAt: "2024-01-01T10:00:00Z"
  },
  {
    id: "3",
    name: "Payment Reminder",
    content: "💰 Payment reminder: Your course fee of ${amount} is due in {days} days. Please pay to avoid interruption.",
    type: "reminder",
    variables: ["amount", "days"],
    isActive: true,
    usageCount: 8,
    createdAt: "2024-01-01T10:00:00Z"
  }
];

export default function AdminSMS() {
  const [activeTab, setActiveTab] = useState<"messages" | "templates">("messages");
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<SMSMessage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<SMSMessage | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  
  const [composeForm, setComposeForm] = useState({
    message: "",
    target: "all" as SMSTarget,
    type: "notification" as SMSType,
    recipients: "",
    scheduledAt: "",
    campaign: "",
    template: ""
  });

  const [templateForm, setTemplateForm] = useState({
    name: "",
    content: "",
    type: "transactional" as SMSType,
    variables: "",
    isActive: true
  });

  const queryClient = useQueryClient();

  // Mock API calls
  const { data: smsMessages = [], isLoading: isLoadingMessages } = useQuery({
    queryKey: ['admin-sms-messages'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockSMSMessages;
    }
  });

  const { data: smsTemplates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ['admin-sms-templates'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockSMSTemplates;
    }
  });

  const sendSMSMutation = useMutation({
    mutationFn: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id: Date.now().toString(), ...data, createdAt: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sms-messages'] });
      toast({
        title: "SMS sent successfully",
        description: "Your SMS has been sent to recipients.",
      });
      setIsComposeDialogOpen(false);
      resetComposeForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send SMS. Please try again.",
        variant: "destructive",
      });
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id: Date.now().toString(), ...data, createdAt: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sms-templates'] });
      toast({
        title: "Template created successfully",
        description: "Your SMS template has been saved.",
      });
      setIsTemplateDialogOpen(false);
      resetTemplateForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteSMSMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sms-messages'] });
      toast({
        title: "SMS deleted successfully",
        description: "The SMS has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete SMS. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetComposeForm = () => {
    setComposeForm({
      message: "",
      target: "all",
      type: "notification",
      recipients: "",
      scheduledAt: "",
      campaign: "",
      template: ""
    });
  };

  const resetTemplateForm = () => {
    setTemplateForm({
      name: "",
      content: "",
      type: "transactional",
      variables: "",
      isActive: true
    });
  };

  const handleSendSMS = () => {
    if (!composeForm.message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message.",
        variant: "destructive",
      });
      return;
    }

    const recipients = composeForm.target === "custom" 
      ? composeForm.recipients.split(',').map(r => r.trim()).filter(r => r)
      : [];

    const recipientCount = composeForm.target === "custom" ? recipients.length : 100; // Mock count

    const status = composeForm.scheduledAt ? "pending" : "sent";
    const cost = recipientCount * 0.05; // Mock cost calculation

    sendSMSMutation.mutate({
      ...composeForm,
      recipients,
      recipientCount,
      status,
      cost,
      deliveredCount: 0,
      failedCount: 0,
      sentAt: composeForm.scheduledAt ? undefined : new Date().toISOString(),
      createdBy: "Admin"
    });
  };

  const handleCreateTemplate = () => {
    if (!templateForm.name.trim() || !templateForm.content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const variables = templateForm.variables.split(',').map(v => v.trim()).filter(v => v);

    createTemplateMutation.mutate({
      ...templateForm,
      variables,
      usageCount: 0
    });
  };

  const handleDeleteClick = (message: SMSMessage) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (messageToDelete) {
      deleteSMSMutation.mutate(messageToDelete.id);
    }
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  const handleUseTemplate = (template: SMSTemplate) => {
    setComposeForm(prev => ({
      ...prev,
      message: template.content,
      type: template.type,
      template: template.id
    }));
    setIsComposeDialogOpen(true);
  };

  const filteredMessages = smsMessages.filter(message => {
    const matchesSearch = message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.campaign?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    const matchesType = typeFilter === "all" || message.type === typeFilter;
    const matchesTarget = targetFilter === "all" || message.target === targetFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesTarget;
  });

  const getStatusIcon = (status: SMSStatus) => {
    switch (status) {
      case "sent":
        return <Send className="h-4 w-4 text-blue-500" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: SMSStatus) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getTypeColor = (type: SMSType) => {
    switch (type) {
      case "promotional":
        return "bg-purple-100 text-purple-800";
      case "transactional":
        return "bg-blue-100 text-blue-800";
      case "reminder":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    totalSent: smsMessages.filter(m => m.status === "sent" || m.status === "delivered").length,
    totalDelivered: smsMessages.reduce((sum, m) => sum + m.deliveredCount, 0),
    totalFailed: smsMessages.reduce((sum, m) => sum + m.failedCount, 0),
    totalCost: smsMessages.reduce((sum, m) => sum + m.cost, 0),
    deliveryRate: smsMessages.length > 0 ? 
      ((smsMessages.reduce((sum, m) => sum + m.deliveredCount, 0) / 
        smsMessages.reduce((sum, m) => sum + m.recipientCount, 0)) * 100).toFixed(1) : "0"
  };

  return (
    <AdminLayout title="SMS Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalDelivered}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalFailed}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deliveryRate}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 font-medium border-b-2 ${activeTab === "messages" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Messages
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 font-medium border-b-2 ${activeTab === "templates" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
          >
            Templates
          </button>
        </div>

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <>
            {/* Actions and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-col lg:flex-row gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Send SMS
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Send SMS</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Enter your SMS message (max 160 characters)"
                        value={composeForm.message}
                        onChange={(e) => setComposeForm(prev => ({ ...prev, message: e.target.value.slice(0, 160) }))}
                        rows={4}
                        maxLength={160}
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {composeForm.message.length}/160 characters
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="target">Target Audience</Label>
                        <Select value={composeForm.target} onValueChange={(value) => setComposeForm(prev => ({ ...prev, target: value as SMSTarget }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select target" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="students">Students</SelectItem>
                            <SelectItem value="instructors">Instructors</SelectItem>
                            <SelectItem value="parents">Parents</SelectItem>
                            <SelectItem value="custom">Custom List</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="type">Message Type</Label>
                        <Select value={composeForm.type} onValueChange={(value) => setComposeForm(prev => ({ ...prev, type: value as SMSType }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="promotional">Promotional</SelectItem>
                            <SelectItem value="transactional">Transactional</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                            <SelectItem value="notification">Notification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {composeForm.target === "custom" && (
                      <div>
                        <Label htmlFor="recipients">Recipients (Phone Numbers)</Label>
                        <Textarea
                          id="recipients"
                          placeholder="Enter phone numbers separated by commas (e.g., +1234567890, +1234567891)"
                          value={composeForm.recipients}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, recipients: e.target.value }))}
                          rows={3}
                        />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="campaign">Campaign (Optional)</Label>
                        <Input
                          id="campaign"
                          placeholder="Enter campaign name"
                          value={composeForm.campaign}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, campaign: e.target.value }))}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
                        <Input
                          id="scheduledAt"
                          type="datetime-local"
                          value={composeForm.scheduledAt}
                          onChange={(e) => setComposeForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendSMS} disabled={sendSMSMutation.isPending}>
                        {sendSMSMutation.isPending ? "Sending..." : "Send SMS"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Messages Table */}
            <Card>
              <CardHeader>
                <CardTitle>SMS Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingMessages ? (
                  <div className="text-center py-8">Loading messages...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Message</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Delivery</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMessages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-medium text-sm truncate">{message.message}</p>
                              {message.campaign && (
                                <p className="text-xs text-gray-500">{message.campaign}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getTypeColor(message.type)}>
                              {message.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              <Users className="h-3 w-3 mr-1" />
                              {message.target}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(message.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(message.status)}
                                <span className="capitalize">{message.status}</span>
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell>{message.recipientCount}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div className="text-green-600">✓ {message.deliveredCount}</div>
                              {message.failedCount > 0 && (
                                <div className="text-red-600">✗ {message.failedCount}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>${message.cost.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(message.createdAt).toLocaleDateString()}</div>
                              <div className="text-gray-500">{message.createdBy}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedMessage(message)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(message)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Templates Tab */}
        {activeTab === "templates" && (
          <>
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">SMS Templates</h3>
              <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create SMS Template</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="templateName">Template Name *</Label>
                      <Input
                        id="templateName"
                        placeholder="Enter template name"
                        value={templateForm.name}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="templateContent">Template Content *</Label>
                      <Textarea
                        id="templateContent"
                        placeholder="Enter template content. Use {variable_name} for dynamic content."
                        value={templateForm.content}
                        onChange={(e) => setTemplateForm(prev => ({ ...prev, content: e.target.value.slice(0, 160) }))}
                        rows={4}
                        maxLength={160}
                      />
                      <div className="text-sm text-gray-500 mt-1">
                        {templateForm.content.length}/160 characters
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="templateType">Template Type</Label>
                        <Select value={templateForm.type} onValueChange={(value) => setTemplateForm(prev => ({ ...prev, type: value as SMSType }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="promotional">Promotional</SelectItem>
                            <SelectItem value="transactional">Transactional</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                            <SelectItem value="notification">Notification</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="templateVariables">Variables (Optional)</Label>
                        <Input
                          id="templateVariables"
                          placeholder="e.g., course_name, start_date"
                          value={templateForm.variables}
                          onChange={(e) => setTemplateForm(prev => ({ ...prev, variables: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="templateActive"
                        checked={templateForm.isActive}
                        onCheckedChange={(checked) => setTemplateForm(prev => ({ ...prev, isActive: checked }))}
                      />
                      <Label htmlFor="templateActive">Active</Label>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateTemplate} disabled={createTemplateMutation.isPending}>
                        {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingTemplates ? (
                <div className="col-span-full text-center py-8">Loading templates...</div>
              ) : (
                smsTemplates.map((template) => (
                  <Card key={template.id} className="relative">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge className={getTypeColor(template.type)}>
                          {template.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-3">{template.content}</p>
                      
                      {template.variables.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-500">Variables:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {template.variables.map((variable, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                        <span>Used {template.usageCount} times</span>
                        <span className={template.isActive ? "text-green-600" : "text-red-600"}>
                          {template.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                          className="flex-1"
                        >
                          Use Template
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </>
        )}

        {/* Message Details Dialog */}
        <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>SMS Details</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Message</p>
                  <p className="font-medium">{selectedMessage.message}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <Badge className={getTypeColor(selectedMessage.type)}>
                      {selectedMessage.type}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Target</p>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {selectedMessage.target}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getStatusColor(selectedMessage.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedMessage.status)}
                      <span className="capitalize">{selectedMessage.status}</span>
                    </div>
                  </Badge>
                </div>
                
                {selectedMessage.campaign && (
                  <div>
                    <p className="text-sm text-gray-500">Campaign</p>
                    <p className="font-medium">{selectedMessage.campaign}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{selectedMessage.recipientCount}</div>
                    <div className="text-sm text-gray-500">Recipients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedMessage.deliveredCount}</div>
                    <div className="text-sm text-gray-500">Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{selectedMessage.failedCount}</div>
                    <div className="text-sm text-gray-500">Failed</div>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Created on {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                  <span>Cost: ${selectedMessage.cost.toFixed(2)}</span>
                </div>
                
                {selectedMessage.sentAt && (
                  <div>
                    <p className="text-sm text-gray-500">Sent on {new Date(selectedMessage.sentAt).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the SMS message.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
