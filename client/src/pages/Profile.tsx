import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@shared/schema";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

// Schema for profile update
const profileSchema = z.object({
  firstName: z.string().min(2, { message: "First name is required" }).optional(),
  lastName: z.string().min(2, { message: "Last name is required" }).optional(),
  email: z.string().email({ message: "Please enter a valid email" }),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(6, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Status badge colors
const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function Profile() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      setLocation("/");
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to view your profile",
      });
    }
  }, [user, authLoading, setLocation, toast]);
  
  // Profile update form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      address: user?.address || "",
    },
  });
  
  // Update form values when user data loads
  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user, profileForm]);
  
  // Password change form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Fetch user bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    enabled: !!user,
  });
  
  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      if (!user) throw new Error("User not authenticated");
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Please try again later.",
      });
    },
  });
  
  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: PasswordFormValues) => {
      if (!user) throw new Error("User not authenticated");
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, {
        password: data.newPassword,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Password change failed",
        description: error.message || "Please try again later.",
      });
    },
  });
  
  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest("PATCH", `/api/bookings/${bookingId}`, {
        status: "cancelled",
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking cancelled",
        description: "Your booking has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowCancelDialog(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Cancellation failed",
        description: error.message || "Please try again later.",
      });
    },
  });
  
  // Handle profile update submission
  function onProfileSubmit(data: ProfileFormValues) {
    updateProfileMutation.mutate(data);
  }
  
  // Handle password change submission
  function onPasswordSubmit(data: PasswordFormValues) {
    // In a real app, you would verify the current password first
    changePasswordMutation.mutate(data);
  }
  
  // Handle booking cancellation
  function confirmCancelBooking() {
    if (selectedBooking) {
      cancelBookingMutation.mutate(selectedBooking.id);
    }
  }
  
  // Handle view booking details
  function viewBookingDetails(booking: Booking) {
    setSelectedBooking(booking);
  }
  
  if (authLoading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect via the useEffect
  }

  return (
    <>
      <Helmet>
        <title>My Profile | Cleopatra Eyewear Collection</title>
        <meta name="description" content="Manage your Cleopatra Eyewear account, view order history, update profile details, and change your password." />
      </Helmet>
      
      <div className="container mx-auto py-12 px-4">
        <h1 className="text-3xl font-bold mb-6 font-poppins">My Account</h1>
        
        <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and address.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={profileForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={profileForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={profileForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary-dark"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Bookings Tab */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>
                  View and manage your caravan booking requests.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : bookings && bookings.length > 0 ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bookings.map((booking) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              {format(new Date(booking.date), "PPP")}
                              <div className="text-sm text-neutral-500">
                                {format(new Date(booking.date), "p")}
                              </div>
                            </TableCell>
                            <TableCell>{booking.location}</TableCell>
                            <TableCell>
                              <Badge className={statusColors[booking.status] || ""}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => viewBookingDetails(booking)}
                              >
                                View
                              </Button>
                              {booking.status === "pending" && (
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowCancelDialog(true);
                                  }}
                                >
                                  Cancel
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                      You haven't made any bookings yet.
                    </p>
                    <Button 
                      onClick={() => setLocation("/book-caravan")}
                      className="bg-primary hover:bg-primary-dark"
                    >
                      Book Caravan Now
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setLocation("/book-caravan")}
                >
                  Make New Booking
                </Button>
              </CardFooter>
            </Card>
            
            {/* Booking Details Dialog */}
            {selectedBooking && (
              <Dialog open={!!selectedBooking && !showCancelDialog} onOpenChange={() => setSelectedBooking(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Booking Details</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm font-medium">Booking ID:</div>
                      <div className="text-sm">{selectedBooking.id}</div>
                      
                      <div className="text-sm font-medium">Date:</div>
                      <div className="text-sm">{format(new Date(selectedBooking.date), "PPP")}</div>
                      
                      <div className="text-sm font-medium">Time:</div>
                      <div className="text-sm">{format(new Date(selectedBooking.date), "p")}</div>
                      
                      <div className="text-sm font-medium">Location:</div>
                      <div className="text-sm">{selectedBooking.location}</div>
                      
                      <div className="text-sm font-medium">Attendees:</div>
                      <div className="text-sm">{selectedBooking.attendees}</div>
                      
                      <div className="text-sm font-medium">Status:</div>
                      <div className="text-sm">
                        <Badge className={statusColors[selectedBooking.status] || ""}>
                          {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                        </Badge>
                      </div>
                      
                      {selectedBooking.staffId && (
                        <>
                          <div className="text-sm font-medium">Assigned Staff:</div>
                          <div className="text-sm">Staff ID: {selectedBooking.staffId}</div>
                        </>
                      )}
                    </div>
                    
                    {selectedBooking.notes && (
                      <div>
                        <div className="text-sm font-medium">Notes:</div>
                        <div className="text-sm mt-1 p-2 bg-neutral-50 dark:bg-neutral-800 rounded">
                          {selectedBooking.notes}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <DialogFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                      Close
                    </Button>
                    {selectedBooking.status === "pending" && (
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          setShowCancelDialog(true);
                        }}
                      >
                        Cancel Booking
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            
            {/* Cancel Booking Confirmation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel Booking</DialogTitle>
                </DialogHeader>
                
                <div className="py-4">
                  <p>Are you sure you want to cancel this booking? This action cannot be undone.</p>
                  
                  {selectedBooking && (
                    <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded">
                      <p className="font-medium">Booking Details:</p>
                      <p className="text-sm">Date: {format(new Date(selectedBooking.date), "PPP")}</p>
                      <p className="text-sm">Time: {format(new Date(selectedBooking.date), "p")}</p>
                      <p className="text-sm">Location: {selectedBooking.location}</p>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                    Keep Booking
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmCancelBooking}
                    disabled={cancelBookingMutation.isPending}
                  >
                    {cancelBookingMutation.isPending ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-destructive-foreground border-t-transparent"></div>
                        Cancelling...
                      </>
                    ) : (
                      "Yes, Cancel Booking"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>
                  Manage your password and account security.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={passwordForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-dark"
                        disabled={changePasswordMutation.isPending}
                      >
                        {changePasswordMutation.isPending ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
                            Changing...
                          </>
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
                
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-medium mb-4">Account Actions</h3>
                  <div className="flex flex-col space-y-2">
                    <Button 
                      variant="outline" 
                      onClick={logout}
                    >
                      Sign Out
                    </Button>
                    <Button variant="destructive">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
