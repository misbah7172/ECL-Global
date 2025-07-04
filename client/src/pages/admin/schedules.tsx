import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search, Calendar as CalendarIcon, Clock, Users, BookOpen, Filter } from "lucide-react";
import { format } from "date-fns";

interface Schedule {
  id: number;
  courseId: number;
  courseName: string;
  instructorId: number;
  instructorName: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  enrolledStudents: number;
  isActive: boolean;
  createdAt: string;
}

const daysOfWeek = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export default function AdminSchedules() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dayFilter, setDayFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState({
    courseId: "",
    instructorId: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    startDate: new Date(),
    endDate: new Date(),
    maxStudents: 20,
    isActive: true,
  });

  const queryClient = useQueryClient();

  const { data: schedules, isLoading } = useQuery({
    queryKey: ['/api/schedules'],
    queryFn: async () => {
      // In real app, this would fetch from API
      const mockSchedules: Schedule[] = [
        {
          id: 1,
          courseId: 1,
          courseName: "Web Development Fundamentals",
          instructorId: 1,
          instructorName: "Sarah Johnson",
          dayOfWeek: "monday",
          startTime: "09:00",
          endTime: "11:00",
          startDate: "2024-07-08",
          endDate: "2024-09-30",
          maxStudents: 25,
          enrolledStudents: 22,
          isActive: true,
          createdAt: "2024-07-01",
        },
        {
          id: 2,
          courseId: 2,
          courseName: "React Advanced Concepts",
          instructorId: 2,
          instructorName: "Michael Chen",
          dayOfWeek: "wednesday",
          startTime: "14:00",
          endTime: "16:00",
          startDate: "2024-07-10",
          endDate: "2024-08-28",
          maxStudents: 20,
          enrolledStudents: 18,
          isActive: true,
          createdAt: "2024-07-01",
        },
        {
          id: 3,
          courseId: 3,
          courseName: "Data Science Bootcamp",
          instructorId: 3,
          instructorName: "Emily Davis",
          dayOfWeek: "friday",
          startTime: "10:00",
          endTime: "12:00",
          startDate: "2024-07-12",
          endDate: "2024-10-04",
          maxStudents: 15,
          enrolledStudents: 14,
          isActive: true,
          createdAt: "2024-07-01",
        },
      ];
      return mockSchedules;
    },
  });

  const { data: courses } = useQuery({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses');
      if (!response.ok) throw new Error('Failed to fetch courses');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // In real app, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { ...data, id: Date.now() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      setIsCreateModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Schedule created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create schedule",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      // In real app, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Schedule updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      // In real app, this would call the API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schedules'] });
      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      courseId: "",
      instructorId: "",
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      startDate: new Date(),
      endDate: new Date(),
      maxStudents: 20,
      isActive: true,
    });
    setSelectedSchedule(null);
  };

  const handleCreate = () => {
    setIsCreateModalOpen(true);
    resetForm();
  };

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setFormData({
      courseId: schedule.courseId.toString(),
      instructorId: schedule.instructorId.toString(),
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      startDate: new Date(schedule.startDate),
      endDate: new Date(schedule.endDate),
      maxStudents: schedule.maxStudents,
      isActive: schedule.isActive,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this schedule?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      startDate: format(formData.startDate, "yyyy-MM-dd"),
      endDate: format(formData.endDate, "yyyy-MM-dd"),
    };
    
    if (selectedSchedule) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const filteredSchedules = schedules?.filter((schedule: Schedule) => {
    const matchesSearch = schedule.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDay = dayFilter === "all" || schedule.dayOfWeek === dayFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && schedule.isActive) ||
                         (statusFilter === "inactive" && !schedule.isActive);
    return matchesSearch && matchesDay && matchesStatus;
  });

  const getStatusColor = (schedule: Schedule) => {
    if (!schedule.isActive) return "secondary";
    if (schedule.enrolledStudents >= schedule.maxStudents) return "destructive";
    if (schedule.enrolledStudents / schedule.maxStudents > 0.8) return "default";
    return "outline";
  };

  const getStatusText = (schedule: Schedule) => {
    if (!schedule.isActive) return "Inactive";
    if (schedule.enrolledStudents >= schedule.maxStudents) return "Full";
    return "Active";
  };

  const ScheduleForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="courseId">Course</Label>
          <Select value={formData.courseId} onValueChange={(value) => setFormData({ ...formData, courseId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses?.map((course: any) => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dayOfWeek">Day of Week</Label>
          <Select value={formData.dayOfWeek} onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>
            <SelectContent>
              {daysOfWeek.map((day) => (
                <SelectItem key={day.value} value={day.value}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(formData.startDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.startDate}
                onSelect={(date) => date && setFormData({ ...formData, startDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(formData.endDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={formData.endDate}
                onSelect={(date) => date && setFormData({ ...formData, endDate: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <Label htmlFor="maxStudents">Maximum Students</Label>
        <Input
          id="maxStudents"
          type="number"
          value={formData.maxStudents}
          onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) })}
          min="1"
          max="100"
          required
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          {selectedSchedule ? "Update Schedule" : "Create Schedule"}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <AdminLayout title="Schedules">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Schedules</h1>
            <p className="text-gray-600 mt-1">Manage course schedules and timetables</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Schedule
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filter Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search schedules..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={dayFilter} onValueChange={setDayFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Days</SelectItem>
                  {daysOfWeek.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schedules Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Schedules</CardTitle>
            <CardDescription>
              {filteredSchedules?.length || 0} schedules found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Instructor</TableHead>
                  <TableHead>Day & Time</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      Loading schedules...
                    </TableCell>
                  </TableRow>
                ) : filteredSchedules?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">
                      No schedules found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchedules?.map((schedule: Schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4" />
                          <span className="font-medium">{schedule.courseName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{schedule.instructorName}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span className="capitalize">{schedule.dayOfWeek}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{schedule.startTime} - {schedule.endTime}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(schedule.startDate), "MMM dd, yyyy")}</div>
                          <div className="text-gray-500">to {format(new Date(schedule.endDate), "MMM dd, yyyy")}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>{schedule.enrolledStudents}/{schedule.maxStudents}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(schedule)}>
                          {getStatusText(schedule)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(schedule)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(schedule.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Schedule Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Schedule</DialogTitle>
              <DialogDescription>
                Add a new schedule for course sessions
              </DialogDescription>
            </DialogHeader>
            <ScheduleForm />
          </DialogContent>
        </Dialog>

        {/* Edit Schedule Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Schedule</DialogTitle>
              <DialogDescription>
                Update schedule information
              </DialogDescription>
            </DialogHeader>
            <ScheduleForm />
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
