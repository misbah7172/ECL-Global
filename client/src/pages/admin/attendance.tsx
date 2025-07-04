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
import { Plus, Search, Calendar as CalendarIcon, Clock, Users, BookOpen, Filter, Download, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface AttendanceRecord {
  id: number;
  scheduleId: number;
  courseName: string;
  instructorName: string;
  date: string;
  startTime: string;
  endTime: string;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
  attendanceRate: number;
  isMarked: boolean;
}

interface StudentAttendance {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  status: 'present' | 'absent' | 'late';
  markedAt?: string;
}

export default function AdminAttendance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [courseFilter, setCourseFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isMarkAttendanceModalOpen, setIsMarkAttendanceModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<AttendanceRecord | null>(null);
  const [studentAttendances, setStudentAttendances] = useState<StudentAttendance[]>([]);

  const queryClient = useQueryClient();

  const { data: attendanceRecords, isLoading } = useQuery({
    queryKey: ['/api/admin/attendance'],
    queryFn: async () => {
      // Mock data - in real app, this would fetch from API
      const mockRecords: AttendanceRecord[] = [
        {
          id: 1,
          scheduleId: 101,
          courseName: "Web Development Fundamentals",
          instructorName: "Sarah Johnson",
          date: "2024-01-15",
          startTime: "09:00",
          endTime: "11:00",
          totalStudents: 25,
          presentStudents: 23,
          absentStudents: 2,
          lateStudents: 1,
          attendanceRate: 92,
          isMarked: true,
        },
        {
          id: 2,
          scheduleId: 102,
          courseName: "Data Science Bootcamp",
          instructorName: "Mike Chen",
          date: "2024-01-15",
          startTime: "14:00",
          endTime: "16:00",
          totalStudents: 20,
          presentStudents: 18,
          absentStudents: 2,
          lateStudents: 0,
          attendanceRate: 90,
          isMarked: true,
        },
        {
          id: 3,
          scheduleId: 103,
          courseName: "Mobile App Development",
          instructorName: "Jennifer Davis",
          date: "2024-01-16",
          startTime: "10:00",
          endTime: "12:00",
          totalStudents: 18,
          presentStudents: 0,
          absentStudents: 0,
          lateStudents: 0,
          attendanceRate: 0,
          isMarked: false,
        },
      ];
      return mockRecords;
    },
  });

  const { data: courses } = useQuery({
    queryKey: ['/api/courses'],
    queryFn: async () => {
      return [
        { id: 1, name: "Web Development Fundamentals" },
        { id: 2, name: "Data Science Bootcamp" },
        { id: 3, name: "Mobile App Development" },
      ];
    },
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async ({ scheduleId, attendances }: { scheduleId: number; attendances: StudentAttendance[] }) => {
      const response = await fetch(`/api/admin/attendance/${scheduleId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attendances }),
      });
      if (!response.ok) throw new Error('Failed to mark attendance');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/attendance'] });
      toast({ title: "Success", description: "Attendance marked successfully" });
      setIsMarkAttendanceModalOpen(false);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to mark attendance", variant: "destructive" });
    },
  });

  const filteredRecords = attendanceRecords?.filter(record => {
    const matchesSearch = record.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.instructorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !dateFilter || record.date === format(dateFilter, 'yyyy-MM-dd');
    const matchesCourse = courseFilter === "all" || record.courseName === courseFilter;
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "marked" && record.isMarked) ||
                         (statusFilter === "pending" && !record.isMarked);
    
    return matchesSearch && matchesDate && matchesCourse && matchesStatus;
  });

  const handleMarkAttendance = (schedule: AttendanceRecord) => {
    setSelectedSchedule(schedule);
    // Mock student data for the selected schedule
    const mockStudents: StudentAttendance[] = [
      { id: 1, studentId: 101, studentName: "Alice Johnson", studentEmail: "alice@example.com", status: 'present' },
      { id: 2, studentId: 102, studentName: "Bob Smith", studentEmail: "bob@example.com", status: 'present' },
      { id: 3, studentId: 103, studentName: "Charlie Brown", studentEmail: "charlie@example.com", status: 'absent' },
    ];
    setStudentAttendances(mockStudents);
    setIsMarkAttendanceModalOpen(true);
  };

  const handleAttendanceStatusChange = (studentId: number, status: 'present' | 'absent' | 'late') => {
    setStudentAttendances(prev => 
      prev.map(student => 
        student.studentId === studentId ? { ...student, status } : student
      )
    );
  };

  const handleSaveAttendance = () => {
    if (!selectedSchedule) return;
    markAttendanceMutation.mutate({
      scheduleId: selectedSchedule.scheduleId,
      attendances: studentAttendances,
    });
  };

  const exportAttendance = () => {
    // Mock export functionality
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Course,Instructor,Date,Time,Total Students,Present,Absent,Late,Attendance Rate\n" +
      filteredRecords?.map(record => 
        `${record.courseName},${record.instructorName},${record.date},${record.startTime}-${record.endTime},${record.totalStudents},${record.presentStudents},${record.absentStudents},${record.lateStudents},${record.attendanceRate}%`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title="Attendance Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Classes</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                3 completed, 5 pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">87%</div>
              <p className="text-xs text-muted-foreground">
                +2% from last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">245</div>
              <p className="text-xs text-muted-foreground">
                Across all courses
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Attendance</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">
                Classes need attendance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              Track and manage student attendance across all courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses or instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, 'PPP') : 'Select date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses?.map(course => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="marked">Marked</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportAttendance} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>

            {/* Attendance Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredRecords?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords?.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.courseName}</TableCell>
                        <TableCell>{record.instructorName}</TableCell>
                        <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{record.startTime} - {record.endTime}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Present: {record.presentStudents}</div>
                            <div>Absent: {record.absentStudents}</div>
                            {record.lateStudents > 0 && <div>Late: {record.lateStudents}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={`font-medium ${record.attendanceRate >= 90 ? 'text-green-600' : 
                                                           record.attendanceRate >= 80 ? 'text-yellow-600' : 
                                                           'text-red-600'}`}>
                              {record.attendanceRate}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={record.isMarked ? "default" : "secondary"}>
                            {record.isMarked ? "Marked" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkAttendance(record)}
                            disabled={record.isMarked}
                          >
                            {record.isMarked ? "View" : "Mark"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Mark Attendance Modal */}
        <Dialog open={isMarkAttendanceModalOpen} onOpenChange={setIsMarkAttendanceModalOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
              <DialogDescription>
                {selectedSchedule && (
                  <>
                    {selectedSchedule.courseName} - {selectedSchedule.instructorName}
                    <br />
                    {format(new Date(selectedSchedule.date), 'PPP')} | {selectedSchedule.startTime} - {selectedSchedule.endTime}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentAttendances.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentName}</TableCell>
                      <TableCell>{student.studentEmail}</TableCell>
                      <TableCell>
                        <Select
                          value={student.status}
                          onValueChange={(value: 'present' | 'absent' | 'late') => 
                            handleAttendanceStatusChange(student.studentId, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present">
                              <div className="flex items-center">
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                Present
                              </div>
                            </SelectItem>
                            <SelectItem value="absent">
                              <div className="flex items-center">
                                <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                Absent
                              </div>
                            </SelectItem>
                            <SelectItem value="late">
                              <div className="flex items-center">
                                <Clock className="mr-2 h-4 w-4 text-yellow-500" />
                                Late
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsMarkAttendanceModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAttendance} disabled={markAttendanceMutation.isPending}>
                {markAttendanceMutation.isPending ? "Saving..." : "Save Attendance"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
