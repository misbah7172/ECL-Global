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
import { Bell, Plus, Edit, Trash2, Send, Users, Eye, Calendar, AlertCircle, CheckCircle, Clock, Search, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type NotificationType = "info" | "success" | "warning" | "error";
type NotificationTarget = "all" | "students" | "instructors" | "admins";
type NotificationStatus = "draft" | "scheduled" | "sent" | "failed";

type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  target: NotificationTarget;
  status: NotificationStatus;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
  createdBy: string;
  recipients: number;
  readCount: number;
  clickCount: number;
  isActive: boolean;
  actionUrl?: string;
  actionText?: string;
};

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Welcome to New Semester",
    message: "Welcome back! The new semester starts on Monday. Check your schedule and course materials.",
    type: "info",
    target: "students",
    status: "sent",
    sentAt: "2024-01-15T09:00:00Z",
    createdAt: "2024-01-14T16:30:00Z",
    createdBy: "Admin",
    recipients: 450,
    readCount: 380,
    clickCount: 45,
    isActive: true,
    actionUrl: "/dashboard",
    actionText: "View Dashboard"
  },
  {
    id: "2",
    title: "System Maintenance",
    message: "The system will be under maintenance on Saturday from 2 AM to 4 AM. Please plan accordingly.",
    type: "warning",
    target: "all",
    status: "scheduled",
    scheduledAt: "2024-01-20T02:00:00Z",
    createdAt: "2024-01-15T10:00:00Z",
    createdBy: "Tech Admin",
    recipients: 750,
    readCount: 0,
    clickCount: 0,
    isActive: true
  },
  {
    id: "3",
    title: "New Course Available",
    message: "We're excited to announce our new Advanced Machine Learning course. Early bird discount available!",
    type: "success",
    target: "students",
    status: "draft",
    createdAt: "2024-01-15T14:20:00Z",
    createdBy: "Course Manager",
    recipients: 0,
    readCount: 0,
    clickCount: 0,
    isActive: false,
    actionUrl: "/courses/ml-advanced",
    actionText: "View Course"
  }
];

export default function AdminNotifications() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<Notification | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [targetFilter, setTargetFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info" as NotificationType,
    target: "all" as NotificationTarget,
    scheduledAt: "",
    actionUrl: "",
    actionText: "",
    isActive: true
  });

  const queryClient = useQueryClient();

  // Mock API calls
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockNotifications;
    }
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (data: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id: Date.now().toString(), ...data, createdAt: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast({
        title: "Notification created successfully",
        description: "The notification has been saved.",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create notification. Please try again.",
        variant: "destructive",
      });
    }
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast({
        title: "Notification sent successfully",
        description: "The notification has been sent to recipients.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteNotificationMutation = useMutation({
    mutationFn: async (id: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      toast({
        title: "Notification deleted successfully",
        description: "The notification has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete notification. Please try again.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      type: "info",
      target: "all",
      scheduledAt: "",
      actionUrl: "",
      actionText: "",
      isActive: true
    });
  };

  const handleCreateNotification = () => {
    if (!formData.title || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const status = formData.scheduledAt ? "scheduled" : "draft";
    createNotificationMutation.mutate({ ...formData, status });
  };

  const handleSendNotification = (notification: Notification) => {
    sendNotificationMutation.mutate(notification.id);
  };

  const handleDeleteClick = (notification: Notification) => {
    setNotificationToDelete(notification);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (notificationToDelete) {
      deleteNotificationMutation.mutate(notificationToDelete.id);
    }
    setDeleteDialogOpen(false);
    setNotificationToDelete(null);
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || notification.status === statusFilter;
    const matchesTarget = targetFilter === "all" || notification.target === targetFilter;
    const matchesType = typeFilter === "all" || notification.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesTarget && matchesType;
  });

  const getStatusIcon = (status: NotificationStatus) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-blue-500" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Edit className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: NotificationStatus) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: NotificationType) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const stats = {
    total: notifications.length,
    sent: notifications.filter(n => n.status === "sent").length,
    scheduled: notifications.filter(n => n.status === "scheduled").length,
    draft: notifications.filter(n => n.status === "draft").length,
    totalRecipients: notifications.reduce((sum, n) => sum + n.recipients, 0)
  };

  return (
    <AdminLayout title="Notifications Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.sent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRecipients}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions and Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={targetFilter} onValueChange={setTargetFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Targets</SelectItem>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="instructors">Instructors</SelectItem>
                <SelectItem value="admins">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Notification</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter notification title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter notification message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as NotificationType }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="target">Target Audience</Label>
                    <Select value={formData.target} onValueChange={(value) => setFormData(prev => ({ ...prev, target: value as NotificationTarget }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="students">Students</SelectItem>
                        <SelectItem value="instructors">Instructors</SelectItem>
                        <SelectItem value="admins">Admins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="actionUrl">Action URL (Optional)</Label>
                    <Input
                      id="actionUrl"
                      placeholder="https://example.com"
                      value={formData.actionUrl}
                      onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="actionText">Action Text (Optional)</Label>
                    <Input
                      id="actionText"
                      placeholder="Click here"
                      value={formData.actionText}
                      onChange={(e) => setFormData(prev => ({ ...prev, actionText: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateNotification} disabled={createNotificationMutation.isPending}>
                    {createNotificationMutation.isPending ? "Creating..." : "Create Notification"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Notifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading notifications...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-gray-500 truncate">{notification.message}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(notification.type)}>
                          {notification.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          {notification.target}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(notification.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(notification.status)}
                            <span className="capitalize">{notification.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>{notification.recipients}</TableCell>
                      <TableCell>
                        {notification.status === "sent" && (
                          <div className="text-sm">
                            <div>Read: {notification.readCount}</div>
                            <div>Clicks: {notification.clickCount}</div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(notification.createdAt).toLocaleDateString()}</div>
                          <div className="text-gray-500">{notification.createdBy}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedNotification(notification)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {notification.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSendNotification(notification)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(notification)}
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

        {/* Notification Details Dialog */}
        <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Notification Details</DialogTitle>
            </DialogHeader>
            {selectedNotification && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Title</p>
                  <p className="font-medium">{selectedNotification.title}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Message</p>
                  <p className="text-gray-700">{selectedNotification.message}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <Badge className={getTypeColor(selectedNotification.type)}>
                      {selectedNotification.type}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Target</p>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {selectedNotification.target}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={getStatusColor(selectedNotification.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(selectedNotification.status)}
                      <span className="capitalize">{selectedNotification.status}</span>
                    </div>
                  </Badge>
                </div>
                
                {selectedNotification.actionUrl && (
                  <div>
                    <p className="text-sm text-gray-500">Action</p>
                    <p className="text-blue-600">{selectedNotification.actionText || "Click here"}: {selectedNotification.actionUrl}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p>{new Date(selectedNotification.createdAt).toLocaleString()}</p>
                    <p className="text-sm text-gray-500">by {selectedNotification.createdBy}</p>
                  </div>
                  
                  {selectedNotification.sentAt && (
                    <div>
                      <p className="text-sm text-gray-500">Sent</p>
                      <p>{new Date(selectedNotification.sentAt).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                
                {selectedNotification.status === "sent" && (
                  <div>
                    <p className="text-sm text-gray-500">Engagement</p>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedNotification.recipients}</div>
                        <div className="text-sm text-gray-500">Recipients</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedNotification.readCount}</div>
                        <div className="text-sm text-gray-500">Read</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{selectedNotification.clickCount}</div>
                        <div className="text-sm text-gray-500">Clicks</div>
                      </div>
                    </div>
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
                This action cannot be undone. This will permanently delete the notification
                "{notificationToDelete?.title}".
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
