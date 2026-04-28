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
import { apiRequest } from "@/lib/queryClient";
import { Search, Filter, DollarSign, CreditCard, Download, Eye, RefreshCw, Calendar as CalendarIcon, TrendingUp, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Payment {
  id: number;
  transactionId: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseName: string;
  amount: number;
  currency: string;
  paymentMethod: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'disputed';
  paymentDate: string;
  dueDate: string;
  description: string;
  gatewayTransactionId?: string;
  paymentGateway: 'stripe' | 'paypal' | 'square' | 'razorpay' | 'manual';
  refundAmount?: number;
  refundDate?: string;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

const paymentStatusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-blue-100 text-blue-800',
  disputed: 'bg-purple-100 text-purple-800',
};

const paymentMethodColors = {
  credit_card: 'bg-blue-100 text-blue-800',
  debit_card: 'bg-green-100 text-green-800',
  paypal: 'bg-purple-100 text-purple-800',
  bank_transfer: 'bg-orange-100 text-orange-800',
  cash: 'bg-gray-100 text-gray-800',
  other: 'bg-gray-100 text-gray-800',
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AdminPayments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['/api/admin/payments'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/admin/payments');
      if (!response.ok) {
        throw new Error('Failed to load payments');
      }
      return response.json();
    },
  });

  const refundMutation = useMutation({
    mutationFn: async ({ id, amount, reason }: { id: number; amount: number; reason: string }) => {
      const response = await apiRequest('POST', `/api/admin/payments/${id}/refund`, { amount, reason });
      if (!response.ok) throw new Error('Failed to process refund');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      toast({ title: "Success", description: "Refund processed successfully" });
      setIsRefundModalOpen(false);
      setRefundAmount("");
      setRefundReason("");
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to process refund", variant: "destructive" });
    },
  });

  const retryPaymentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('POST', `/api/admin/payments/${id}/retry`);
      if (!response.ok) throw new Error('Failed to retry payment');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/payments'] });
      toast({ title: "Success", description: "Payment retry initiated" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to retry payment", variant: "destructive" });
    },
  });

  const filteredPayments = payments?.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter;
    const matchesDate = !dateFilter || 
                       new Date(payment.paymentDate).toDateString() === dateFilter.toDateString();
    
    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });

  // Statistics calculations
  const totalRevenue = payments?.reduce((sum, payment) => 
    payment.status === 'completed' ? sum + payment.amount : sum, 0) || 0;
  const pendingAmount = payments?.reduce((sum, payment) => 
    payment.status === 'pending' ? sum + payment.amount : sum, 0) || 0;
  const refundedAmount = payments?.reduce((sum, payment) => 
    payment.status === 'refunded' ? sum + (payment.refundAmount || 0) : sum, 0) || 0;
  const failedAmount = payments?.reduce((sum, payment) => 
    payment.status === 'failed' ? sum + payment.amount : sum, 0) || 0;

  // Payment method distribution
  const methodDistribution = payments?.reduce((acc, payment) => {
    acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const methodChartData = Object.entries(methodDistribution || {}).map(([method, count]) => ({
    name: method.replace('_', ' ').toUpperCase(),
    value: count,
  }));

  const revenueTrend = (() => {
    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyStats = new Map<string, { revenue: number; transactions: number }>();

    (payments || []).forEach((payment) => {
      if (payment.status !== 'completed') {
        return;
      }
      const date = new Date(payment.paymentDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const current = monthlyStats.get(key) || { revenue: 0, transactions: 0 };
      current.revenue += payment.amount;
      current.transactions += 1;
      monthlyStats.set(key, current);
    });

    const sortedKeys = Array.from(monthlyStats.keys()).sort();
    return sortedKeys.slice(-6).map((key) => {
      const [year, monthIndex] = key.split('-').map(Number);
      const stats = monthlyStats.get(key)!;
      return {
        month: `${monthLabels[monthIndex]} ${String(year).slice(2)}`,
        revenue: stats.revenue,
        transactions: stats.transactions,
      };
    });
  })();

  const handleRefund = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundAmount(payment.amount.toString());
    setIsRefundModalOpen(true);
  };

  const handleRetryPayment = (id: number) => {
    retryPaymentMutation.mutate(id);
  };

  const processRefund = () => {
    if (!selectedPayment) return;
    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Invalid refund amount", variant: "destructive" });
      return;
    }
    refundMutation.mutate({
      id: selectedPayment.id,
      amount,
      reason: refundReason,
    });
  };

  const exportPayments = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Transaction ID,Student Name,Student Email,Course,Amount,Currency,Method,Status,Payment Date,Due Date,Gateway\n" +
      filteredPayments?.map(payment => 
        `${payment.transactionId},"${payment.studentName}","${payment.studentEmail}","${payment.courseName}",${payment.amount},${payment.currency},${payment.paymentMethod},${payment.status},"${payment.paymentDate}","${payment.dueDate}",${payment.paymentGateway}`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payments.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  return (
    <AdminLayout title="Payments Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {payments?.filter(p => p.status === 'pending').length || 0} transactions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Refunded</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(refundedAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {payments?.filter(p => p.status === 'refunded').length || 0} refunds
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(failedAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {payments?.filter(p => p.status === 'failed').length || 0} failed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue and transaction count</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" />
                  <Line type="monotone" dataKey="transactions" stroke="#82ca9d" name="Transactions" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Distribution of payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={methodChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {methodChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Payment Transactions</CardTitle>
                <CardDescription>
                  Manage all payment transactions and process refunds
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={exportPayments} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                  <SelectItem value="disputed">Disputed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="debit_card">Debit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
            </div>

            {/* Payments Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
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
                  ) : filteredPayments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        No payments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPayments?.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{payment.transactionId}</div>
                            <div className="text-muted-foreground">
                              {payment.paymentGateway}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">{payment.studentName}</div>
                            <div className="text-muted-foreground">
                              {payment.studentEmail}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{payment.courseName}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="font-medium">
                              {formatCurrency(payment.amount, payment.currency)}
                            </div>
                            {payment.refundAmount && (
                              <div className="text-xs text-muted-foreground">
                                Refunded: {formatCurrency(payment.refundAmount, payment.currency)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={paymentMethodColors[payment.paymentMethod]}>
                            {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={paymentStatusColors[payment.status]}>
                            {payment.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(payment.paymentDate), 'hh:mm a')}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {payment.status === 'completed' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRefund(payment)}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            {payment.status === 'failed' && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRetryPayment(payment.id)}
                              >
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Refund Modal */}
        <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Process Refund</DialogTitle>
              <DialogDescription>
                Issue a refund for this payment transaction
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Transaction Details</Label>
                  <div className="text-sm p-3 bg-muted rounded-md">
                    <div>Transaction ID: {selectedPayment.transactionId}</div>
                    <div>Student: {selectedPayment.studentName}</div>
                    <div>Course: {selectedPayment.courseName}</div>
                    <div>Original Amount: {formatCurrency(selectedPayment.amount, selectedPayment.currency)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refundAmount">Refund Amount</Label>
                  <Input
                    id="refundAmount"
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    min="0"
                    max={selectedPayment.amount}
                    step="0.01"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="refundReason">Reason for Refund</Label>
                  <Input
                    id="refundReason"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Enter reason for refund"
                    required
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsRefundModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={processRefund} disabled={refundMutation.isPending}>
                {refundMutation.isPending ? "Processing..." : "Process Refund"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
