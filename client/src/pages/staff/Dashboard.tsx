import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Booking, Feedback } from "@shared/schema";
import { format } from "date-fns";
import { statusColors } from "@/lib/constants";

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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Icons } from "@/components/ui/icons";

export default function StaffDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
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
  
  // Fetch staff bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user && (user.role === "staff" || user.role === "admin"),
  });
  
  // Fetch feedback
  const { data: feedback, isLoading: feedbackLoading } = useQuery<Feedback[]>({
    queryKey: ["/api/feedback"],
    enabled: !!user && (user.role === "staff" || user.role === "admin"),
  });
  
  // Filter bookings for this staff member
  const staffBookings = bookings?.filter(booking => 
    booking.staffId === user?.id || 
    user?.role === "admin" // Admin can see all bookings
  ) || [];
  
  // Filter upcoming bookings
  const upcomingBookings = staffBookings
    .filter(booking => 
      new Date(booking.date) > new Date() && 
      booking.status !== "cancelled"
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Filter recent feedback
  const recentFeedback = feedback
    ?.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5) || [];
  
  // Calculate statistics
  const todaysBookings = staffBookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    return (
      bookingDate.getDate() === today.getDate() &&
      bookingDate.getMonth() === today.getMonth() &&
      bookingDate.getFullYear() === today.getFullYear()
    );
  }).length;
  
  const pendingBookings = staffBookings.filter(booking => 
    booking.status === "pending"
  ).length;
  
  const confirmedBookings = staffBookings.filter(booking => 
    booking.status === "confirmed"
  ).length;
  
  const todayFormatted = format(new Date(), "EEEE, MMMM d, yyyy");
  
  if (authLoading || (!user || (user.role !== "staff" && user.role !== "admin"))) {
    return null; // Will redirect via the useEffect
  }

  return (
    <>
      <Helmet>
        <title>Staff Dashboard | Cleopatra Eyewear Collection</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      
      <div className="flex">
        {/* Staff Sidebar */}
        <div className="hidden md:flex w-64 flex-col bg-sidebar fixed inset-y-0 z-50 pt-16">
          <div className="flex flex-col flex-grow p-4 overflow-y-auto">
            <div className="py-4 text-sidebar-foreground font-medium">
              <span className="px-4 pb-2 block text-sm text-sidebar-foreground/60">Staff Portal</span>
              <nav className="mt-2 space-y-1">
                <a href="/staff/dashboard" className="px-4 py-2 rounded-md bg-sidebar-accent/10 text-sidebar-primary flex items-center">
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold font-poppins">Staff Dashboard</h1>
                <p className="text-neutral-600 dark:text-neutral-400">{todayFormatted}</p>
              </div>
              
              <div className="mt-4 md:mt-0">
                <Button 
                  className="bg-primary hover:bg-primary-dark" 
                  onClick={() => setLocation("/staff/bookings")}
                >
                  <Icons.time className="mr-2 h-4 w-4" /> View All Bookings
                </Button>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Today's Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{todaysBookings}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Pending Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{pendingBookings}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{confirmedBookings}</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Upcoming Bookings */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Upcoming Bookings</CardTitle>
                <CardDescription>
                  Upcoming caravan appointments assigned to you.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : upcomingBookings.length > 0 ? (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Attendees</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingBookings.slice(0, 5).map((booking) => (
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
                            <TableCell>{booking.attendees || 1}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[booking.status] || ""}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setLocation(`/staff/bookings?id=${booking.id}`)}
                              >
                                View Details
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
                      No upcoming bookings
                    </p>
                    <p className="text-sm text-neutral-500">
                      You have no scheduled appointments at this time.
                    </p>
                  </div>
                )}
                
                {upcomingBookings.length > 5 && (
                  <div className="mt-4 text-center">
                    <Button 
                      variant="link" 
                      onClick={() => setLocation("/staff/bookings")}
                    >
                      View all bookings
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Recent Feedback */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
                <CardDescription>
                  Recent customer feedback from caravan visits.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {feedbackLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : recentFeedback.length > 0 ? (
                  <div className="space-y-4">
                    {recentFeedback.map((item) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between mb-2">
                            <div className="flex items-center">
                              <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                  <Icons.star 
                                    key={i} 
                                    className={`h-4 w-4 ${i >= item.rating ? 'text-neutral-300 dark:text-neutral-600' : ''}`} 
                                  />
                                ))}
                              </div>
                              <span className="ml-2 text-sm text-neutral-500">
                                Booking #{item.bookingId}
                              </span>
                            </div>
                            <span className="text-sm text-neutral-500">
                              {format(new Date(item.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                          
                          {item.comment && (
                            <p className="text-neutral-700 dark:text-neutral-300 mt-2">
                              "{item.comment}"
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Icons.mail className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
                    <p className="text-neutral-600 dark:text-neutral-400 mb-2">
                      No feedback yet
                    </p>
                    <p className="text-sm text-neutral-500">
                      Feedback from customers will appear here.
                    </p>
                  </div>
                )}
                
                {recentFeedback.length > 0 && (
                  <div className="mt-4 text-center">
                    <Button 
                      variant="link" 
                      onClick={() => setLocation("/staff/feedback")}
                    >
                      View all feedback
                    </Button>
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
