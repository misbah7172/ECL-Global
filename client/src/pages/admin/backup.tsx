import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/admin-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Database, Download, Upload, Plus, Trash2, RefreshCw, CheckCircle, XCircle, AlertCircle, Clock, Calendar, HardDrive, Settings, Play, Pause, Archive, FileText, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type BackupStatus = "completed" | "failed" | "in_progress" | "scheduled";
type BackupType = "full" | "incremental" | "differential";

type Backup = {
  id: string;
  name: string;
  type: BackupType;
  status: BackupStatus;
  size: number;
  createdAt: string;
  completedAt?: string;
  duration?: number;
  progress?: number;
  includes: string[];
  location: string;
  checksum: string;
  isEncrypted: boolean;
  retentionDays: number;
  note?: string;
};

type BackupSchedule = {
  id: string;
  name: string;
  type: BackupType;
  frequency: "daily" | "weekly" | "monthly";
  time: string;
  isEnabled: boolean;
  includes: string[];
  location: string;
  retentionDays: number;
  isEncrypted: boolean;
  lastRun?: string;
  nextRun: string;
};

const mockBackups: Backup[] = [
  {
    id: "1",
    name: "Full System Backup - 2024-01-15",
    type: "full",
    status: "completed",
    size: 2048576000, // 2GB in bytes
    createdAt: "2024-01-15T02:00:00Z",
    completedAt: "2024-01-15T02:45:00Z",
    duration: 45,
    includes: ["database", "uploads", "configurations", "logs"],
    location: "/backups/full/2024-01-15.tar.gz",
    checksum: "sha256:abc123...",
    isEncrypted: true,
    retentionDays: 30,
    note: "Monthly full backup"
  },
  {
    id: "2",
    name: "Incremental Backup - 2024-01-16",
    type: "incremental",
    status: "completed",
    size: 104857600, // 100MB in bytes
    createdAt: "2024-01-16T02:00:00Z",
    completedAt: "2024-01-16T02:05:00Z",
    duration: 5,
    includes: ["database", "uploads"],
    location: "/backups/incremental/2024-01-16.tar.gz",
    checksum: "sha256:def456...",
    isEncrypted: true,
    retentionDays: 7
  },
  {
    id: "3",
    name: "Database Backup - 2024-01-17",
    type: "incremental",
    status: "in_progress",
    size: 52428800, // 50MB in bytes
    createdAt: "2024-01-17T02:00:00Z",
    progress: 65,
    includes: ["database"],
    location: "/backups/incremental/2024-01-17.tar.gz",
    checksum: "",
    isEncrypted: true,
    retentionDays: 7
  }
];

const mockSchedules: BackupSchedule[] = [
  {
    id: "1",
    name: "Daily Database Backup",
    type: "incremental",
    frequency: "daily",
    time: "02:00",
    isEnabled: true,
    includes: ["database"],
    location: "/backups/daily/",
    retentionDays: 7,
    isEncrypted: true,
    lastRun: "2024-01-17T02:00:00Z",
    nextRun: "2024-01-18T02:00:00Z"
  },
  {
    id: "2",
    name: "Weekly Full Backup",
    type: "full",
    frequency: "weekly",
    time: "01:00",
    isEnabled: true,
    includes: ["database", "uploads", "configurations", "logs"],
    location: "/backups/weekly/",
    retentionDays: 30,
    isEncrypted: true,
    lastRun: "2024-01-15T01:00:00Z",
    nextRun: "2024-01-22T01:00:00Z"
  }
];

export default function AdminBackup() {
  const [activeTab, setActiveTab] = useState<"backups" | "schedules">("backups");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<Backup | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [backupToDelete, setBackupToDelete] = useState<Backup | null>(null);
  const [isRunningBackup, setIsRunningBackup] = useState(false);
  
  const [scheduleForm, setScheduleForm] = useState({
    name: "",
    type: "incremental" as BackupType,
    frequency: "daily" as "daily" | "weekly" | "monthly",
    time: "02:00",
    includes: [] as string[],
    location: "/backups/",
    retentionDays: 7,
    isEncrypted: true,
    isEnabled: true
  });

  const queryClient = useQueryClient();

  // Mock API calls
  const { data: backups = [], isLoading: isLoadingBackups } = useQuery({
    queryKey: ['admin-backups'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockBackups;
    }
  });

  const { data: schedules = [], isLoading: isLoadingSchedules } = useQuery({
    queryKey: ['admin-backup-schedules'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockSchedules;
    }
  });

  const createBackupMutation = useMutation({
    mutationFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { id: Date.now().toString(), status: "completed" };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-backups'] });
      toast({
        title: "Backup created successfully",
        description: "The backup has been completed and stored securely.",
      });
      setIsRunningBackup(false);
    },
    onError: () => {
      toast({
        title: "Backup failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
      setIsRunningBackup(false);
    }
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { id: Date.now().toString(), ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-backup-schedules'] });
      toast({
        title: "Schedule created successfully",
        description: "The backup schedule has been created.",
      });
      setIsScheduleDialogOpen(false);
      resetScheduleForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create schedule. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteBackupMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-backups'] });
      toast({
        title: "Backup deleted successfully",
        description: "The backup has been permanently deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete backup. Please try again.",
        variant: "destructive",
      });
    }
  });

  const restoreBackupMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return id;
    },
    onSuccess: () => {
      toast({
        title: "Restore completed successfully",
        description: "The system has been restored from the backup.",
      });
    },
    onError: () => {
      toast({
        title: "Restore failed",
        description: "Failed to restore from backup. Please check the backup integrity.",
        variant: "destructive",
      });
    }
  });

  const resetScheduleForm = () => {
    setScheduleForm({
      name: "",
      type: "incremental",
      frequency: "daily",
      time: "02:00",
      includes: [],
      location: "/backups/",
      retentionDays: 7,
      isEncrypted: true,
      isEnabled: true
    });
  };

  const handleRunBackup = () => {
    setIsRunningBackup(true);
    createBackupMutation.mutate();
  };

  const handleCreateSchedule = () => {
    if (!scheduleForm.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a schedule name.",
        variant: "destructive",
      });
      return;
    }

    if (scheduleForm.includes.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one item to include in the backup.",
        variant: "destructive",
      });
      return;
    }

    const nextRun = new Date();
    nextRun.setHours(parseInt(scheduleForm.time.split(':')[0]), parseInt(scheduleForm.time.split(':')[1]), 0, 0);
    if (nextRun <= new Date()) {
      nextRun.setDate(nextRun.getDate() + 1);
    }

    createScheduleMutation.mutate({
      ...scheduleForm,
      nextRun: nextRun.toISOString()
    });
  };

  const handleDeleteClick = (backup: Backup) => {
    setBackupToDelete(backup);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (backupToDelete) {
      deleteBackupMutation.mutate(backupToDelete.id);
    }
    setDeleteDialogOpen(false);
    setBackupToDelete(null);
  };

  const handleRestore = (backup: Backup) => {
    if (backup.status === "completed") {
      restoreBackupMutation.mutate(backup.id);
    }
  };

  const handleDownload = (backup: Backup) => {
    toast({
      title: "Download started",
      description: `Downloading backup: ${backup.name}`,
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: BackupStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "in_progress":
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case "scheduled":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: BackupStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: BackupType) => {
    switch (type) {
      case "full":
        return "bg-purple-100 text-purple-800";
      case "incremental":
        return "bg-blue-100 text-blue-800";
      case "differential":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const availableIncludes = [
    { value: "database", label: "Database", icon: Database },
    { value: "uploads", label: "User Uploads", icon: Upload },
    { value: "configurations", label: "Configurations", icon: Settings },
    { value: "logs", label: "System Logs", icon: FileText }
  ];

  const stats = {
    totalBackups: backups.length,
    totalSize: backups.reduce((sum, backup) => sum + backup.size, 0),
    completedBackups: backups.filter(b => b.status === "completed").length,
    failedBackups: backups.filter(b => b.status === "failed").length,
    activeSchedules: schedules.filter(s => s.isEnabled).length
  };

  return (
    <AdminLayout title="Backup Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBackups}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completedBackups}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.failedBackups}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.activeSchedules}</div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab("backups")}
              className={`px-4 py-2 font-medium border-b-2 ${activeTab === "backups" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              Backups
            </button>
            <button
              onClick={() => setActiveTab("schedules")}
              className={`px-4 py-2 font-medium border-b-2 ${activeTab === "schedules" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
            >
              Schedules
            </button>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={handleRunBackup}
              disabled={isRunningBackup || createBackupMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRunningBackup ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4 mr-2" />
                  Run Backup Now
                </>
              )}
            </Button>
            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Backup Schedule</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="scheduleName">Schedule Name *</Label>
                    <Input
                      id="scheduleName"
                      placeholder="Enter schedule name"
                      value={scheduleForm.name}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduleType">Backup Type</Label>
                      <Select value={scheduleForm.type} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, type: value as BackupType }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Backup</SelectItem>
                          <SelectItem value="incremental">Incremental Backup</SelectItem>
                          <SelectItem value="differential">Differential Backup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="scheduleFrequency">Frequency</Label>
                      <Select value={scheduleForm.frequency} onValueChange={(value) => setScheduleForm(prev => ({ ...prev, frequency: value as "daily" | "weekly" | "monthly" }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="scheduleTime">Time</Label>
                    <Input
                      id="scheduleTime"
                      type="time"
                      value={scheduleForm.time}
                      onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Include in Backup *</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {availableIncludes.map((item) => (
                        <div key={item.value} className="flex items-center space-x-2">
                          <Switch
                            id={`include-${item.value}`}
                            checked={scheduleForm.includes.includes(item.value)}
                            onCheckedChange={(checked) => {
                              setScheduleForm(prev => ({
                                ...prev,
                                includes: checked
                                  ? [...prev.includes, item.value]
                                  : prev.includes.filter(i => i !== item.value)
                              }));
                            }}
                          />
                          <Label htmlFor={`include-${item.value}`} className="flex items-center space-x-2">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduleLocation">Storage Location</Label>
                      <Input
                        id="scheduleLocation"
                        placeholder="Enter storage path"
                        value={scheduleForm.location}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="scheduleRetention">Retention (days)</Label>
                      <Input
                        id="scheduleRetention"
                        type="number"
                        value={scheduleForm.retentionDays}
                        onChange={(e) => setScheduleForm(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="scheduleEncryption"
                        checked={scheduleForm.isEncrypted}
                        onCheckedChange={(checked) => setScheduleForm(prev => ({ ...prev, isEncrypted: checked }))}
                      />
                      <Label htmlFor="scheduleEncryption" className="flex items-center space-x-1">
                        <Shield className="h-4 w-4" />
                        <span>Encrypt Backup</span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="scheduleEnabled"
                        checked={scheduleForm.isEnabled}
                        onCheckedChange={(checked) => setScheduleForm(prev => ({ ...prev, isEnabled: checked }))}
                      />
                      <Label htmlFor="scheduleEnabled">Enable Schedule</Label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateSchedule} disabled={createScheduleMutation.isPending}>
                      {createScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Backups Tab */}
        {activeTab === "backups" && (
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingBackups ? (
                <div className="text-center py-8">Loading backups...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium">{backup.name}</p>
                            <p className="text-sm text-gray-500">{backup.includes.join(', ')}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(backup.type)}>
                            {backup.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(backup.status)}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(backup.status)}
                                <span className="capitalize">{backup.status.replace('_', ' ')}</span>
                              </div>
                            </Badge>
                            {backup.status === "in_progress" && backup.progress && (
                              <div className="w-20">
                                <Progress value={backup.progress} className="h-2" />
                                <span className="text-xs text-gray-500">{backup.progress}%</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <HardDrive className="h-4 w-4 text-gray-400" />
                            <span>{formatFileSize(backup.size)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {backup.duration ? `${backup.duration} min` : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(backup.createdAt).toLocaleDateString()}</div>
                            <div className="text-gray-500">{new Date(backup.createdAt).toLocaleTimeString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedBackup(backup)}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                            {backup.status === "completed" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownload(backup)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRestore(backup)}
                                  className="text-green-600 hover:text-green-700"
                                  disabled={restoreBackupMutation.isPending}
                                >
                                  <Upload className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(backup)}
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
        )}

        {/* Schedules Tab */}
        {activeTab === "schedules" && (
          <Card>
            <CardHeader>
              <CardTitle>Backup Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSchedules ? (
                <div className="text-center py-8">Loading schedules...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium">{schedule.name}</p>
                            <p className="text-sm text-gray-500">{schedule.includes.join(', ')}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(schedule.type)}>
                            {schedule.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            <Calendar className="h-3 w-3 mr-1" />
                            {schedule.frequency}
                          </Badge>
                        </TableCell>
                        <TableCell>{schedule.time}</TableCell>
                        <TableCell>
                          <Badge className={schedule.isEnabled ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {schedule.isEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(schedule.nextRun).toLocaleDateString()}</div>
                            <div className="text-gray-500">{new Date(schedule.nextRun).toLocaleTimeString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className={schedule.isEnabled ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                            >
                              {schedule.isEnabled ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
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
        )}

        {/* Backup Details Dialog */}
        <Dialog open={!!selectedBackup} onOpenChange={() => setSelectedBackup(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Backup Details</DialogTitle>
            </DialogHeader>
            {selectedBackup && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{selectedBackup.name}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <Badge className={getTypeColor(selectedBackup.type)}>
                      {selectedBackup.type}
                    </Badge>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <Badge className={getStatusColor(selectedBackup.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(selectedBackup.status)}
                        <span className="capitalize">{selectedBackup.status.replace('_', ' ')}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Size</p>
                    <p className="font-medium">{formatFileSize(selectedBackup.size)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{selectedBackup.duration ? `${selectedBackup.duration} minutes` : "N/A"}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Includes</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedBackup.includes.map((item, index) => (
                      <Badge key={index} variant="outline">{item}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium font-mono text-sm">{selectedBackup.location}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Encrypted</p>
                    <div className="flex items-center space-x-1">
                      <Shield className={`h-4 w-4 ${selectedBackup.isEncrypted ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="font-medium">{selectedBackup.isEncrypted ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Retention</p>
                    <p className="font-medium">{selectedBackup.retentionDays} days</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Checksum</p>
                  <p className="font-medium font-mono text-sm">{selectedBackup.checksum || "N/A"}</p>
                </div>
                
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Created: {new Date(selectedBackup.createdAt).toLocaleString()}</span>
                  {selectedBackup.completedAt && (
                    <span>Completed: {new Date(selectedBackup.completedAt).toLocaleString()}</span>
                  )}
                </div>
                
                {selectedBackup.note && (
                  <div>
                    <p className="text-sm text-gray-500">Note</p>
                    <p className="text-gray-700">{selectedBackup.note}</p>
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
                This action cannot be undone. This will permanently delete the backup
                "{backupToDelete?.name}" and all its associated data.
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
