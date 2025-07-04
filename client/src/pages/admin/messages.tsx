import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Mail, Reply, Forward, Archive, Trash2, Search, Filter, Plus, Send, Eye, Star, StarOff, MessageSquare, User, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type MessageStatus = "unread" | "read" | "replied" | "archived";
type MessagePriority = "low" | "normal" | "high" | "urgent";
type MessageType = "inquiry" | "complaint" | "suggestion" | "support" | "other";

type Message = {
  id: string;
  subject: string;
  content: string;
  senderName: string;
  senderEmail: string;
  senderAvatar?: string;
  senderRole: "student" | "instructor" | "parent" | "guest";
  recipientName: string;
  recipientEmail: string;
  status: MessageStatus;
  priority: MessagePriority;
  type: MessageType;
  isStarred: boolean;
  createdAt: string;
  readAt?: string;
  repliedAt?: string;
  attachments?: string[];
  thread?: Message[];
};

const mockMessages: Message[] = [
  {
    id: "1",
    subject: "Question about course enrollment",
    content: "Hi, I'm interested in enrolling in the Advanced JavaScript course. Can you please provide more information about the prerequisites and schedule?",
    senderName: "Alice Johnson",
    senderEmail: "alice@example.com",
    senderRole: "student",
    recipientName: "Admin",
    recipientEmail: "admin@mentor.com",
    status: "unread",
    priority: "normal",
    type: "inquiry",
    isStarred: false,
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: "2",
    subject: "Technical issue with video player",
    content: "I'm experiencing issues with the video player in the React course. The videos won't load properly. Can you help me resolve this?",
    senderName: "Bob Smith",
    senderEmail: "bob@example.com",
    senderRole: "student",
    recipientName: "Tech Support",
    recipientEmail: "support@mentor.com",
    status: "replied",
    priority: "high",
    type: "support",
    isStarred: true,
    createdAt: "2024-01-14T14:20:00Z",
    readAt: "2024-01-14T15:00:00Z",
    repliedAt: "2024-01-14T16:30:00Z"
  },
  {
    id: "3",
    subject: "Complaint about instructor behavior",
    content: "I would like to file a complaint about the instructor's unprofessional behavior during yesterday's live session. This is unacceptable.",
    senderName: "Carol Davis",
    senderEmail: "carol@example.com",
    senderRole: "student",
    recipientName: "Admin",
    recipientEmail: "admin@mentor.com",
    status: "read",
    priority: "urgent",
    type: "complaint",
    isStarred: true,
    createdAt: "2024-01-13T09:15:00Z",
    readAt: "2024-01-13T10:00:00Z"
  },
  {
    id: "4",
    subject: "Suggestion for new course",
    content: "I would like to suggest adding a course on GraphQL. Many students are interested in this topic and it would be a great addition to your curriculum.",
    senderName: "David Wilson",
    senderEmail: "david@example.com",
    senderRole: "instructor",
    recipientName: "Course Manager",
    recipientEmail: "courses@mentor.com",
    status: "archived",
    priority: "low",
    type: "suggestion",
    isStarred: false,
    createdAt: "2024-01-12T16:45:00Z",
    readAt: "2024-01-12T17:00:00Z"
  }
];

export default function AdminMessages() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  const [replyContent, setReplyContent] = useState("");
  const [composeForm, setComposeForm] = useState({
    to: "",
    subject: "",
    content: "",
    priority: "normal" as MessagePriority,
    type: "other" as MessageType
  });

  const queryClient = useQueryClient();

  // Mock API calls
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['admin-messages'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockMessages;
    }
  });

  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Message> }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id, updates };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const replyToMessageMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id, content };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast({
        title: "Reply sent successfully",
        description: "Your reply has been sent to the sender.",
      });
      setIsReplyDialogOpen(false);
      setReplyContent("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    }
  });

  const composeMessageMutation = useMutation({
    mutationFn: async (data: any) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id: Date.now().toString(), ...data, createdAt: new Date().toISOString() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast({
        title: "Message sent successfully",
        description: "Your message has been sent.",
      });
      setIsComposeDialogOpen(false);
      setComposeForm({
        to: "",
        subject: "",
        content: "",
        priority: "normal",
        type: "other"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (id: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-messages'] });
      toast({
        title: "Message deleted successfully",
        description: "The message has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleMarkAsRead = (message: Message) => {
    if (message.status === "unread") {
      updateMessageMutation.mutate({
        id: message.id,
        updates: { status: "read", readAt: new Date().toISOString() }
      });
    }
  };

  const handleToggleStar = (message: Message) => {
    updateMessageMutation.mutate({
      id: message.id,
      updates: { isStarred: !message.isStarred }
    });
  };

  const handleArchive = (message: Message) => {
    updateMessageMutation.mutate({
      id: message.id,
      updates: { status: "archived" }
    });
  };

  const handleReply = (message: Message) => {
    setSelectedMessage(message);
    setIsReplyDialogOpen(true);
    handleMarkAsRead(message);
  };

  const handleSendReply = () => {
    if (selectedMessage && replyContent.trim()) {
      replyToMessageMutation.mutate({
        id: selectedMessage.id,
        content: replyContent
      });
    }
  };

  const handleComposeMessage = () => {
    if (!composeForm.to || !composeForm.subject || !composeForm.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    composeMessageMutation.mutate(composeForm);
  };

  const handleDeleteClick = (message: Message) => {
    setMessageToDelete(message);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (messageToDelete) {
      deleteMessageMutation.mutate(messageToDelete.id);
    }
    setDeleteDialogOpen(false);
    setMessageToDelete(null);
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.senderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || message.priority === priorityFilter;
    const matchesType = typeFilter === "all" || message.type === typeFilter;
    const matchesRole = roleFilter === "all" || message.senderRole === roleFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesRole;
  });

  const getStatusIcon = (status: MessageStatus) => {
    switch (status) {
      case "unread":
        return <Mail className="h-4 w-4 text-blue-500" />;
      case "read":
        return <Eye className="h-4 w-4 text-gray-500" />;
      case "replied":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "archived":
        return <Archive className="h-4 w-4 text-gray-400" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: MessageStatus) => {
    switch (status) {
      case "unread":
        return "bg-blue-100 text-blue-800";
      case "read":
        return "bg-gray-100 text-gray-800";
      case "replied":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: MessagePriority) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "normal":
        return "bg-blue-100 text-blue-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: MessageType) => {
    switch (type) {
      case "complaint":
        return "bg-red-100 text-red-800";
      case "support":
        return "bg-purple-100 text-purple-800";
      case "inquiry":
        return "bg-blue-100 text-blue-800";
      case "suggestion":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    total: messages.length,
    unread: messages.filter(m => m.status === "unread").length,
    urgent: messages.filter(m => m.priority === "urgent").length,
    complaints: messages.filter(m => m.type === "complaint").length,
    starred: messages.filter(m => m.isStarred).length
  };

  return (
    <AdminLayout title="Messages Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.unread}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.complaints}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Starred</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.starred}</div>
            </CardContent>
          </Card>
        </div>

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
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="inquiry">Inquiry</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Compose
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Compose Message</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">To *</label>
                  <Input
                    placeholder="Enter recipient email"
                    value={composeForm.to}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, to: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Subject *</label>
                  <Input
                    placeholder="Enter message subject"
                    value={composeForm.subject}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={composeForm.priority} onValueChange={(value) => setComposeForm(prev => ({ ...prev, priority: value as MessagePriority }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <Select value={composeForm.type} onValueChange={(value) => setComposeForm(prev => ({ ...prev, type: value as MessageType }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inquiry">Inquiry</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Message *</label>
                  <Textarea
                    placeholder="Enter your message"
                    value={composeForm.content}
                    onChange={(e) => setComposeForm(prev => ({ ...prev, content: e.target.value }))}
                    rows={6}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleComposeMessage} disabled={composeMessageMutation.isPending}>
                    {composeMessageMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Messages Table */}
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading messages...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sender</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((message) => (
                    <TableRow key={message.id} className={message.status === "unread" ? "bg-blue-50" : ""}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={message.senderAvatar} />
                            <AvatarFallback>
                              {message.senderName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{message.senderName}</p>
                            <p className="text-sm text-gray-500">{message.senderEmail}</p>
                            <Badge variant="outline" className="text-xs">
                              {message.senderRole}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className={`font-medium ${message.status === "unread" ? "text-blue-900" : ""}`}>
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-500 truncate">{message.content}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(message.type)}>
                          {message.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority}
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
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(message.createdAt).toLocaleDateString()}</div>
                          <div className="text-gray-500">{new Date(message.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStar(message)}
                            className={message.isStarred ? "text-yellow-500 hover:text-yellow-600" : "text-gray-400 hover:text-gray-600"}
                          >
                            {message.isStarred ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                          </Button>
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
                            onClick={() => handleReply(message)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(message)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <Archive className="h-4 w-4" />
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

        {/* Message Details Dialog */}
        <Dialog open={!!selectedMessage && !isReplyDialogOpen} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Message Details</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedMessage.senderAvatar} />
                    <AvatarFallback>
                      {selectedMessage.senderName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{selectedMessage.senderName}</p>
                    <p className="text-sm text-gray-500">{selectedMessage.senderEmail}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {selectedMessage.senderRole}
                      </Badge>
                      <Badge className={getPriorityColor(selectedMessage.priority)}>
                        {selectedMessage.priority}
                      </Badge>
                      <Badge className={getTypeColor(selectedMessage.type)}>
                        {selectedMessage.type}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium">{selectedMessage.subject}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Message</p>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Sent on {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                  {selectedMessage.readAt && (
                    <span>Read on {new Date(selectedMessage.readAt).toLocaleString()}</span>
                  )}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => handleReply(selectedMessage)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline" onClick={() => handleArchive(selectedMessage)}>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Reply Dialog */}
        <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reply to Message</DialogTitle>
            </DialogHeader>
            {selectedMessage && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">Replying to:</p>
                  <p className="font-medium">{selectedMessage.subject}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedMessage.senderName} ({selectedMessage.senderEmail})</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Your Reply</label>
                  <Textarea
                    placeholder="Write your reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    rows={6}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSendReply} disabled={!replyContent.trim() || replyToMessageMutation.isPending}>
                    {replyToMessageMutation.isPending ? "Sending..." : "Send Reply"}
                  </Button>
                </div>
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
                This action cannot be undone. This will permanently delete the message
                "{messageToDelete?.subject}" from {messageToDelete?.senderName}.
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
