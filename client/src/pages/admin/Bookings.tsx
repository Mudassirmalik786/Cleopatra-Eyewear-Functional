import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Booking, User } from "@shared/schema";
import { statusColors } from "@/lib/constants";
import { format, parseISO } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/ui/icons";

export default function AdminBookings() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state for editing
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [assignedStaffId, setAssignedStaffId] = useState<number | undefined>(undefined);
  
  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      setLocation("/");
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "You don't have permission to access this page.",
      });
    }
  }, [user, authLoading, setLocation, toast]);
  
  // Fetch bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user && user.role === "admin",
  });
  
  // Fetch staff users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: !!user && user.role === "admin",
  });
  
  // Filter staff users
  const staffUsers = users?.filter(u => u.role === "staff") || [];
  
  // Populate form fields when a booking is selected for editing
  useEffect(() => {
    if (selectedBooking) {
      setStatus(selectedBooking.status);
      setNotes(selectedBooking.notes || "");
      setAssignedStaffId(selectedBooking.staffId);
    }
  }, [selectedBooking]);
  
  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: async (data: { 
      id: number; 
      status: string; 
      notes?: string;
      staffId?: number;
    }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PATCH", `/api/bookings/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowEditDialog(false);
      toast({
        title: "Booking updated",
        description: "The booking has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update booking",
        description: error.message || "Please try again later.",
      });
    },
  });
  
  // Handle form submission
  const handleUpdateBooking = () => {
    if (!selectedBooking) return;
    
    updateBookingMutation.mutate({
      id: selectedBooking.id,
      status,
      notes,
      staffId: assignedStaffId,
    });
  };
  
  // Get user name by ID
  const getUserName = (userId?: number) => {
    if (!userId || !users) return "Unknown User";
    const user = users.find(u => u.id === userId);
    return user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username : "Unknown User";
  };
  
  // Filter bookings based on status, date, and search term
  const filteredBookings = bookings?.filter(booking => {
    // Filter by status
    if (statusFilter && booking.status !== statusFilter) {
      return false;
    }
    
    // Filter by date
    if (dateFilter) {
      const bookingDate = format(new Date(booking.date), "yyyy-MM-dd");
      if (bookingDate !== dateFilter) {
        return false;
      }
    }
    
    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const user = users?.find(u => u.id === booking.userId);
      const userName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username : "";
      
      return (
        booking.location.toLowerCase().includes(lowerCaseSearch) ||
        userName.toLowerCase().includes(lowerCaseSearch) ||
        booking.id.toString().includes(lowerCaseSearch)
      );
    }
    
    return true;
  });
  
  const pendingCount = bookings?.filter(b => b.status === "pending").length || 0;
  const confirmedCount = bookings?.filter(b => b.status === "confirmed").length || 0;
  const completedCount = bookings?.filter(b => b.status === "completed").length || 0;
  const cancelledCount = bookings?.filter(b => b.status === "cancelled").length || 0;
  
  if (authLoading || (!user || user.role !== "admin")) {
    return null; // Will redirect via the useEffect
  }

  return (
    <>
      <Helmet>
        <title>Manage Bookings | Admin | Cleopatra Eyewear Collection</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="hidden md:flex w-64 flex-col bg-sidebar fixed inset-y-0 z-50 pt-16">
          <div className="flex flex-col flex-grow p-4 overflow-y-auto">
            <div className="py-4 text-sidebar-foreground font-medium">
              <span className="px-4 pb-2 block text-sm text-sidebar-foreground/60">Dashboard</span>
              <nav className="mt-2 space-y-1">
                <a href="/admin/dashboard" className="px-4 py-2 rounded-md hover:bg-sidebar-accent/10 text-sidebar-foreground flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  Dashboard
                </a>
                <a href="/admin/products" className="px-4 py-2 rounded-md hover:bg-sidebar-accent/10 text-sidebar-foreground flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                  </svg>
                  Products
                </a>
                <a href="/admin/bookings" className="px-4 py-2 rounded-md bg-sidebar-accent/10 text-sidebar-primary flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Bookings
                </a>
                <a href="/admin/users" className="px-4 py-2 rounded-md hover:bg-sidebar-accent/10 text-sidebar-foreground flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  Users
                </a>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 md:ml-64 pt-16">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold mb-6 font-poppins">Manage Bookings</h1>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Pending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">{pendingCount}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-800 dark:text-green-300">Confirmed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-300">{confirmedCount}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-300">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">{completedCount}</div>
                </CardContent>
              </Card>
              
              <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-800 dark:text-red-300">Cancelled</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-800 dark:text-red-300">{cancelledCount}</div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>
                  View and manage customer bookings for the mobile caravan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search and filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search bookings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                      <div className="absolute left-3 top-2.5 text-neutral-400">
                        <Icons.search className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-40">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={undefined}>All Statuses</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="w-full sm:w-auto">
                      <div className="flex items-center">
                        <Input
                          type="date"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                          className="w-full"
                        />
                        {dateFilter && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-2"
                            onClick={() => setDateFilter(undefined)}
                          >
                            <Icons.close className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Bookings table */}
                {bookingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : filteredBookings && filteredBookings.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Assigned To</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell className="font-medium">{booking.id}</TableCell>
                            <TableCell>{getUserName(booking.userId)}</TableCell>
                            <TableCell>
                              {format(new Date(booking.date), "MMM d, yyyy")}
                              <div className="text-sm text-neutral-500">
                                {format(new Date(booking.date), "h:mm a")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate" title={booking.location}>
                                {booking.location}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={statusColors[booking.status] || ""}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {booking.staffId ? getUserName(booking.staffId) : "Unassigned"}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowViewDialog(true);
                                }}
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowEditDialog(true);
                                }}
                              >
                                Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Icons.time className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                      No bookings found
                    </p>
                    <p className="text-sm text-neutral-500">
                      {searchTerm || statusFilter || dateFilter 
                        ? "Try adjusting your filters" 
                        : "Bookings will appear here when customers make them"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* View Booking Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              View complete booking information.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-neutral-500">Booking ID</Label>
                  <p className="font-medium">{selectedBooking.id}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-neutral-500">Status</Label>
                  <p>
                    <Badge className={statusColors[selectedBooking.status] || ""}>
                      {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                    </Badge>
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm text-neutral-500">Customer</Label>
                  <p className="font-medium">{getUserName(selectedBooking.userId)}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-neutral-500">Assigned Staff</Label>
                  <p className="font-medium">
                    {selectedBooking.staffId ? getUserName(selectedBooking.staffId) : "Unassigned"}
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm text-neutral-500">Date</Label>
                  <p className="font-medium">{format(new Date(selectedBooking.date), "MMMM d, yyyy")}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-neutral-500">Time</Label>
                  <p className="font-medium">{format(new Date(selectedBooking.date), "h:mm a")}</p>
                </div>
                
                <div className="col-span-2">
                  <Label className="text-sm text-neutral-500">Location</Label>
                  <p className="font-medium">{selectedBooking.location}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-neutral-500">Attendees</Label>
                  <p className="font-medium">{selectedBooking.attendees || 1}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-neutral-500">Booked On</Label>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.createdAt), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              
              {selectedBooking.notes && (
                <div>
                  <Label className="text-sm text-neutral-500">Notes</Label>
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-800 rounded-md mt-1">
                    <p className="text-sm whitespace-pre-wrap">{selectedBooking.notes}</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowViewDialog(false)}
            >
              Close
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-dark"
              onClick={() => {
                setShowViewDialog(false);
                setShowEditDialog(true);
              }}
            >
              Edit Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Booking Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
            <DialogDescription>
              Update booking status and details.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <Label className="text-sm text-neutral-500">Booking ID</Label>
                  <p className="font-medium">{selectedBooking.id}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-neutral-500">Customer</Label>
                  <p className="font-medium">{getUserName(selectedBooking.userId)}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-neutral-500">Date</Label>
                  <p className="font-medium">{format(new Date(selectedBooking.date), "MMMM d, yyyy")}</p>
                </div>
                
                <div>
                  <Label className="text-sm text-neutral-500">Time</Label>
                  <p className="font-medium">{format(new Date(selectedBooking.date), "h:mm a")}</p>
                </div>
                
                <div className="col-span-2">
                  <Label className="text-sm text-neutral-500">Location</Label>
                  <p className="font-medium">{selectedBooking.location}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="staff">Assign Staff</Label>
                  <Select 
                    value={assignedStaffId?.toString() || ""} 
                    onValueChange={(value) => setAssignedStaffId(value ? parseInt(value) : undefined)}
                  >
                    <SelectTrigger id="staff">
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {usersLoading ? (
                        <SelectItem value="loading" disabled>
                          Loading staff...
                        </SelectItem>
                      ) : staffUsers.length > 0 ? (
                        staffUsers.map((staffUser) => (
                          <SelectItem key={staffUser.id} value={staffUser.id.toString()}>
                            {`${staffUser.firstName || ""} ${staffUser.lastName || ""}`.trim() || staffUser.username}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>
                          No staff members available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this booking..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditDialog(false);
                setSelectedBooking(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              className="bg-primary hover:bg-primary-dark"
              onClick={handleUpdateBooking}
              disabled={updateBookingMutation.isPending}
            >
              {updateBookingMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
