import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Feedback } from "@shared/schema";
import { format } from "date-fns";

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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";

export default function StaffFeedback() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  
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
  
  // Fetch feedback
  const { data: feedbackItems, isLoading: feedbackLoading } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
    enabled: !!user && (user.role === "staff" || user.role === "admin"),
  });
  
  // Fetch bookings to get staff assignments
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
    enabled: !!user && (user.role === "staff" || user.role === "admin"),
  });
  
  // Filter feedback for staff's bookings
  const staffFeedback = feedbackItems?.filter(feedback => {
    const booking = bookings?.find(b => b.id === feedback.bookingId);
    return booking && (booking.staffId === user?.id || user?.role === "admin");
  }) || [];
  
  // Sort feedback by date
  const sortedFeedback = [...staffFeedback].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Filter feedback based on search term
  const filteredFeedback = sortedFeedback.filter(feedback => {
    if (!searchTerm) return true;
    
    const lowerCaseSearch = searchTerm.toLowerCase();
    return (
      feedback.id.toString().includes(lowerCaseSearch) ||
      feedback.bookingId?.toString().includes(lowerCaseSearch) ||
      feedback.comment?.toLowerCase().includes(lowerCaseSearch)
    );
  });
  
  // Get booking details
  const getBookingDetails = (bookingId: number | null) => {
    if (!bookingId || !bookings) return null;
    return bookings.find(b => b.id === bookingId);
  };
  
  if (authLoading || (!user || (user.role !== "staff" && user.role !== "admin"))) {
    return null; // Will redirect via the useEffect
  }

  return (
    <>
      <Helmet>
        <title>Customer Feedback | Staff | Cleopatra Eyewear Collection</title>
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
                <a href="/staff/bookings" className="px-4 py-2 rounded-md hover:bg-sidebar-accent/10 text-sidebar-foreground flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Bookings
                </a>
                <a href="/staff/feedback" className="px-4 py-2 rounded-md bg-sidebar-accent/10 text-sidebar-primary flex items-center">
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
            <h1 className="text-3xl font-bold mb-6 font-poppins">Customer Feedback</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Feedback & Reviews</CardTitle>
                <CardDescription>
                  View feedback from customers about your caravan services.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search feedback..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                      <div className="absolute left-3 top-2.5 text-neutral-400">
                        <Icons.search className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Feedback items */}
                {feedbackLoading || bookingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : filteredFeedback.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Booking</TableHead>
                          <TableHead>Rating</TableHead>
                          <TableHead>Comment</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFeedback.map((item) => {
                          const booking = getBookingDetails(item.bookingId);
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                {format(new Date(item.createdAt), "MMM d, yyyy")}
                              </TableCell>
                              <TableCell>
                                {booking ? (
                                  <div>
                                    <div className="font-medium">
                                      Booking #{item.bookingId}
                                    </div>
                                    <div className="text-sm text-neutral-500">
                                      {format(new Date(booking.date), "MMM d, yyyy")}
                                    </div>
                                  </div>
                                ) : (
                                  <span>Booking #{item.bookingId}</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex text-amber-400">
                                  {[...Array(5)].map((_, i) => (
                                    <svg
                                      key={i}
                                      className={`h-4 w-4 ${i >= item.rating ? 'text-neutral-300 dark:text-neutral-600' : ''}`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs truncate" title={item.comment || ""}>
                                  {item.comment || <span className="text-neutral-500 italic">No comment provided</span>}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => booking && setLocation(`/staff/bookings?id=${booking.id}`)}
                                  disabled={!booking}
                                >
                                  View Booking
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <svg
                      className="h-10 w-10 text-neutral-400 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                    <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                      No feedback found
                    </p>
                    <p className="text-sm text-neutral-500">
                      {searchTerm
                        ? "No feedback matches your search criteria."
                        : "No feedback has been submitted for your services yet."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}