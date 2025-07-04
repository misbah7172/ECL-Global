import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Star, Eye, MessageSquare, CheckCircle, XCircle, AlertCircle, Search, Filter, Trash2, Reply } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type Review = {
  id: string;
  studentName: string;
  studentEmail: string;
  studentAvatar?: string;
  courseName: string;
  courseId: string;
  rating: number;
  title: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  isVerified: boolean;
  helpful: number;
  adminResponse?: string;
};

const mockReviews: Review[] = [
  {
    id: "1",
    studentName: "Alice Johnson",
    studentEmail: "alice@example.com",
    courseName: "Advanced JavaScript",
    courseId: "course-1",
    rating: 5,
    title: "Excellent course!",
    comment: "This course really helped me understand advanced JavaScript concepts. The instructor was very knowledgeable and the examples were practical.",
    status: "approved",
    createdAt: "2024-01-15T10:30:00Z",
    isVerified: true,
    helpful: 15,
    adminResponse: "Thank you for your feedback! We're glad you found the course helpful."
  },
  {
    id: "2",
    studentName: "Bob Smith",
    studentEmail: "bob@example.com",
    courseName: "React Fundamentals",
    courseId: "course-2",
    rating: 4,
    title: "Good course, but could be better",
    comment: "The course content was good but I felt some topics could have been explained in more detail. Overall satisfied with the learning experience.",
    status: "pending",
    createdAt: "2024-01-14T14:20:00Z",
    isVerified: false,
    helpful: 8
  },
  {
    id: "3",
    studentName: "Carol Davis",
    studentEmail: "carol@example.com",
    courseName: "Python for Data Science",
    courseId: "course-3",
    rating: 2,
    title: "Disappointing",
    comment: "The course was outdated and the instructor seemed unprepared. I wouldn't recommend this to others.",
    status: "rejected",
    createdAt: "2024-01-13T09:15:00Z",
    isVerified: false,
    helpful: 3
  }
];

export default function AdminReviews() {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  // Mock API calls
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockReviews;
    }
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, status, adminResponse }: { id: string; status: string; adminResponse?: string }) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id, status, adminResponse };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({
        title: "Review updated successfully",
        description: "The review status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update review. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: string) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({
        title: "Review deleted successfully",
        description: "The review has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleStatusChange = (review: Review, status: "approved" | "rejected") => {
    updateReviewMutation.mutate({ id: review.id, status });
  };

  const handleAddResponse = (review: Review) => {
    setSelectedReview(review);
    setAdminResponse(review.adminResponse || "");
    setIsResponseDialogOpen(true);
  };

  const handleSaveResponse = () => {
    if (selectedReview) {
      updateReviewMutation.mutate({
        id: selectedReview.id,
        status: selectedReview.status,
        adminResponse: adminResponse
      });
    }
    setIsResponseDialogOpen(false);
    setSelectedReview(null);
    setAdminResponse("");
  };

  const handleDeleteClick = (review: Review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (reviewToDelete) {
      deleteReviewMutation.mutate(reviewToDelete.id);
    }
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || review.status === statusFilter;
    const matchesRating = ratingFilter === "all" || review.rating === parseInt(ratingFilter);
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.status === "approved").length,
    pending: reviews.filter(r => r.status === "pending").length,
    rejected: reviews.filter(r => r.status === "rejected").length,
    averageRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : "0"
  };

  return (
    <AdminLayout title="Reviews Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageRating} ⭐</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading reviews...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={review.studentAvatar} />
                            <AvatarFallback>
                              {review.studentName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.studentName}</p>
                            <p className="text-sm text-gray-500">{review.studentEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{review.courseName}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">({review.rating})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium text-sm">{review.title}</p>
                          <p className="text-sm text-gray-500 truncate">{review.comment}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(review.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(review.status)}
                            <span className="capitalize">{review.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedReview(review)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAddResponse(review)}
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                          {review.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(review, "approved")}
                                className="text-green-600 hover:text-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStatusChange(review, "rejected")}
                                className="text-red-600 hover:text-red-700"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(review)}
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

        {/* Review Details Dialog */}
        <Dialog open={!!selectedReview && !isResponseDialogOpen} onOpenChange={() => setSelectedReview(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Review Details</DialogTitle>
            </DialogHeader>
            {selectedReview && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedReview.studentAvatar} />
                    <AvatarFallback>
                      {selectedReview.studentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedReview.studentName}</p>
                    <p className="text-sm text-gray-500">{selectedReview.studentEmail}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium">{selectedReview.courseName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Rating</p>
                  <div className="flex items-center space-x-1">
                    {renderStars(selectedReview.rating)}
                    <span className="text-sm text-gray-500">({selectedReview.rating}/5)</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Review Title</p>
                  <p className="font-medium">{selectedReview.title}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Comment</p>
                  <p className="text-gray-700">{selectedReview.comment}</p>
                </div>
                
                {selectedReview.adminResponse && (
                  <div>
                    <p className="text-sm text-gray-500">Admin Response</p>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded">{selectedReview.adminResponse}</p>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Posted on {new Date(selectedReview.createdAt).toLocaleDateString()}</span>
                  <span>{selectedReview.helpful} people found this helpful</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Admin Response Dialog */}
        <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Admin Response</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Review</p>
                <p className="font-medium">{selectedReview?.title}</p>
                <p className="text-sm text-gray-600">{selectedReview?.comment}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Your Response</p>
                <Textarea
                  placeholder="Write your response to this review..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveResponse} disabled={!adminResponse.trim()}>
                  Save Response
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the review
                "{reviewToDelete?.title}" by {reviewToDelete?.studentName}.
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
