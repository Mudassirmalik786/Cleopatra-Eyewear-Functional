import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Booking, Feedback } from "@shared/schema";
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

export default function StaffBookings() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [dateFilter, setDateFilter] = useState<string | undefined>(undefined);
  
  // Form state for updating
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  
  // Parse URL query parameter for booking ID
  const { search } = window.location;
  const params = new URLSearchParams(search);
  const bookingIdParam = params.get("id");
  
  // Redirect if not staff
  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "staff" && user.role !== "admin"))) {
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
    enabled: !!user && (user.role === "staff" || user.role === "admin"),
  });
  
  // Fetch feedback
  const { data: feedbackItems, isLoading: feedbackLoading } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
    enabled: !!user && (user.role === "staff" || user.role === "admin"),
  });
  
  // Filter bookings for this staff member
  const staffBookings = bookings?.filter(booking => 
    booking.staffId === user?.id || 
    user?.role === "admin" // Admin can see all bookings
  ) || [];
  
  // Effect to select booking from URL parameter
  useEffect(() => {
    if (bookingIdParam && bookings) {
      const booking = bookings.find(b => b.id.toString() === bookingIdParam);
      if (booking) {
        setSelectedBooking(booking);
        setShowViewDialog(true);
      }
    }
  }, [bookingIdParam, bookings]);
  
  // Populate form fields when a booking is selected for updating
  useEffect(() => {
    if (selectedBooking) {
      setStatus(selectedBooking.status || "");
      setNotes(selectedBooking.notes || "");
    }
  }, [selectedBooking]);
  
  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: async (data: { 
      id: number; 
      status: string; 
      notes?: string;
    }) => {
      const { id, ...updateData } = data;
      const response = await apiRequest("PATCH", `/api/bookings/${id}`, updateData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowUpdateDialog(false);
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
  
  // Create feedback mutation
  const createFeedbackMutation = useMutation({
    mutationFn: async (data: { 
      bookingId: number; 
      rating: number; 
      comment?: string;
    }) => {
      const response = await apiRequest("POST", "/api/feedback", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback"] });
      setShowFeedbackForm(false);
      toast({
        title: "Feedback submitted",
        description: "Thank you for submitting your feedback.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to submit feedback",
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
    });
  };
  
  // Handle feedback submission
  const handleSubmitFeedback = () => {
    if (!selectedBooking) return;
    
    createFeedbackMutation.mutate({
      bookingId: selectedBooking.id,
      rating: feedbackRating,
      comment: feedbackComment,
    });
  };
  
  // Check if booking has feedback
  const hasFeedback = (bookingId: number) => {
    return feedbackItems?.some(item => item.bookingId === bookingId);
  };
  
  // Get booking feedback
  const getBookingFeedback = (bookingId: number) => {
    return feedbackItems?.find(item => item.bookingId === bookingId);
  };
  
  // Filter bookings based on status, date, and search term
  const filteredBookings = staffBookings.filter(booking => {
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
    
    return true;
  });
  
  if (authLoading || (!user || (user.role !== "staff" && user.role !== "admin"))) {
    return null; // Will redirect via the useEffect
  }

  return (
    <>
      <Helmet>
        <title>Manage Bookings | Staff | Cleopatra Eyewear Collection</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="flex">
        {/* Staff Sidebar */}
        <div className="hidden md:flex w-64 flex-col bg-sidebar fixed inset-y-0 z-50 pt-16">
          <div className="flex flex-col flex-grow p-4 overflow-y-auto">
            <div className="py-4 text-sidebar-foreground font-medium">
              <span className="px-4 pb-2 block text-sm text-sidebar-foreground/60">Staff Portal</span>
              <nav className="mt-2 space-y-1">
                <a href="/staff/dashboard" className="px-4 py-2 rounded-md hover:bg-sidebar-accent/10 text-sidebar-foreground flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                  </svg>
                  Dashboard
                </a>
                <a href="/staff/bookings" className="px-4 py-2 rounded-md bg-sidebar-accent/10 text-sidebar-primary flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Bookings
                </a>
                <a href="/staff/feedback" className="px-4 py-2 rounded-md hover:bg-sidebar-accent/10 text-sidebar-foreground flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
                  </svg>
                  Feedback
                </a>
              </nav>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 md:ml-64 pt-16">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold mb-6 font-poppins">My Bookings</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Assigned Bookings</CardTitle>
                <CardDescription>
                  Manage your assigned mobile caravan bookings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
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
                
                {/* Bookings table */}
                {bookingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : filteredBookings.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Feedback</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div className="font-medium">
                                {format(new Date(booking.date), "MMM d, yyyy")}
                              </div>
                              <div className="text-sm text-neutral-500">
                                {format(new Date(booking.date), "h:mm a")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-xs truncate" title={booking.location}>
                                {booking.location}
                              </div>
                            </TableCell>
                            <TableCell>Customer #{booking.userId}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[booking.status] || ""}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {hasFeedback(booking.id) ? (
                                <div className="flex text-amber-400">
                                  {[...Array(5)].map((_, i) => {
                                    const feedback = getBookingFeedback(booking.id);
                                    return (
                                      <Icons.star 
                                        key={i} 
                                        className={`h-4 w-4 ${i >= (feedback?.rating || 0) ? 'text-neutral-300 dark:text-neutral-600' : ''}`} 
                                      />
                                    );
                                  })}
                                </div>
                              ) : booking.status === "completed" ? (
                                <span className="text-sm text-neutral-500">No feedback yet</span>
                              ) : null}
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
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Icons.calendar className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                      No bookings found
                    </p>
                    <p className="text-sm text-neutral-500">
                      No bookings match your current filters.
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Booking #{selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-neutral-500">Date</Label>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.date), "MMMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-neutral-500">Time</Label>
                  <p className="font-medium">
                    {format(new Date(selectedBooking.date), "h:mm a")}
                  </p>
                </div>
              </div>
              
              <div>
                <Label className="text-xs text-neutral-500">Location</Label>
                <p className="font-medium">{selectedBooking.location}</p>
              </div>
              
              <div>
                <Label className="text-xs text-neutral-500">Customer</Label>
                <p className="font-medium">Customer #{selectedBooking.userId}</p>
              </div>
              
              <div>
                <Label className="text-xs text-neutral-500">Number of Attendees</Label>
                <p className="font-medium">{selectedBooking.attendees || 1}</p>
              </div>
              
              <div>
                <Label className="text-xs text-neutral-500">Status</Label>
                <Badge className={`mt-1 ${statusColors[selectedBooking.status] || ""}`}>
                  {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                </Badge>
              </div>
              
              {selectedBooking.notes && (
                <div>
                  <Label className="text-xs text-neutral-500">Notes</Label>
                  <p className="text-sm mt-1">{selectedBooking.notes}</p>
                </div>
              )}
              
              {hasFeedback(selectedBooking.id) && (
                <div>
                  <Label className="text-xs text-neutral-500">Customer Feedback</Label>
                  <div className="mt-1">
                    <div className="flex text-amber-400 mb-1">
                      {[...Array(5)].map((_, i) => {
                        const feedback = getBookingFeedback(selectedBooking.id);
                        return (
                          <Icons.star 
                            key={i} 
                            className={`h-4 w-4 ${i >= (feedback?.rating || 0) ? 'text-neutral-300 dark:text-neutral-600' : ''}`} 
                          />
                        );
                      })}
                    </div>
                    {getBookingFeedback(selectedBooking.id)?.comment && (
                      <p className="text-sm italic">
                        "{getBookingFeedback(selectedBooking.id)?.comment}"
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowViewDialog(false)}
            >
              Close
            </Button>
            
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              {selectedBooking && selectedBooking.status !== "cancelled" && selectedBooking.status !== "completed" && (
                <Button
                  variant="default"
                  onClick={() => {
                    setShowViewDialog(false);
                    setShowUpdateDialog(true);
                  }}
                >
                  Update Status
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Update Booking Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Booking Status</DialogTitle>
            <DialogDescription>
              Update the status for booking #{selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
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
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this booking"
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowUpdateDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleUpdateBooking}
              disabled={updateBookingMutation.isPending}
            >
              {updateBookingMutation.isPending ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : "Update Booking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}