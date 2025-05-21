import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Booking, User } from "@shared/schema";
import { statusColors, timeSlots } from "@/lib/constants";

// Components
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth-context";

// Icons
import { CalendarIcon, Search, UserCircle, MapPin, Clock, CheckCircle, XCircle } from "lucide-react";

export default function StaffBookings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updateNotes, setUpdateNotes] = useState("");
  const [updateStatus, setUpdateStatus] = useState("");

  // Get staff bookings
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["staff-bookings"],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/staff/bookings?staffId=${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Get all users for reference
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async (data: { id: number; status: string; notes?: string }) => {
      const res = await apiRequest("/api/bookings/" + data.id, {
        method: "PATCH",
        body: JSON.stringify({
          status: data.status,
          notes: data.notes,
        }),
      });
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Booking updated",
        description: "The booking has been successfully updated.",
      });
      setIsDetailsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["staff-bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter bookings
  const filteredBookings = bookings.filter((booking: Booking) => {
    // Search filter
    const customerName = users.find((u: User) => u.id === booking.userId)?.username || "";
    const searchMatches =
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (booking.notes && booking.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    // Date filter
    let dateMatches = true;
    if (filterDate) {
      const bookingDate = new Date(booking.date);
      dateMatches =
        bookingDate.getDate() === filterDate.getDate() &&
        bookingDate.getMonth() === filterDate.getMonth() &&
        bookingDate.getFullYear() === filterDate.getFullYear();
    }

    // Status filter
    let statusMatches = true;
    if (filterStatus !== "all") {
      statusMatches = booking.status === filterStatus;
    }

    return searchMatches && dateMatches && statusMatches;
  });

  // Get user name by ID
  const getUserName = (userId: number | null): string => {
    if (!userId) return "Unknown";
    const user = users.find((u: User) => u.id === userId);
    return user ? user.username : "Unknown";
  };

  // Handle booking details
  const viewBookingDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setUpdateNotes(booking.notes || "");
    setUpdateStatus(booking.status || "");
    setIsDetailsOpen(true);
  };

  // Handle update booking
  const handleUpdateBooking = () => {
    if (!selectedBooking) return;
    
    updateBookingMutation.mutate({
      id: selectedBooking.id,
      status: updateStatus,
      notes: updateNotes,
    });
  };

  return (
    <>
      <Helmet>
        <title>Staff Bookings | Cleopatra Eyewear</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">Manage Your Bookings</h1>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer, location..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <Calendar
              mode="single"
              selected={filterDate}
              onSelect={setFilterDate}
              className="border rounded-md p-2"
            />
            {filterDate && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFilterDate(null)}
                className="h-8 w-8"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Booking tabs */}
        <Tabs defaultValue="upcoming" className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Bookings</TabsTrigger>
          </TabsList>
          
          {["upcoming", "completed", "all"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-0">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="loader w-8 h-8 rounded-full border-4 border-muted"></div>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-lg">
                  <UserCircle className="mx-auto h-12 w-12 text-muted" />
                  <h3 className="mt-4 text-lg font-medium">No bookings found</h3>
                  <p className="mt-2 text-muted-foreground">
                    {searchQuery || filterDate || filterStatus !== "all"
                      ? "Try adjusting your filters"
                      : "You don't have any bookings yet"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBookings
                    .filter((booking: Booking) => {
                      if (tab === "all") return true;
                      if (tab === "upcoming")
                        return ["pending", "confirmed", "in-progress"].includes(booking.status || "");
                      if (tab === "completed")
                        return ["completed", "cancelled"].includes(booking.status || "");
                      return true;
                    })
                    .map((booking: Booking) => (
                      <Card key={booking.id} className="overflow-hidden">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">
                                {format(new Date(booking.date), "MMM d, yyyy")}
                              </CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {getUserName(booking.userId)}
                              </p>
                            </div>
                            <Badge className={`bg-${statusColors[booking.status || "pending"]}`}>
                              {booking.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="flex items-start gap-3 mb-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <span>{booking.location}</span>
                          </div>
                          <div className="flex items-start gap-3 mb-2">
                            <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                            <span>{timeSlots[booking.attendees || 0]}</span>
                          </div>
                          {booking.notes && (
                            <div className="mt-3 p-2 bg-accent rounded-md text-sm">
                              {booking.notes.length > 100
                                ? `${booking.notes.substring(0, 100)}...`
                                : booking.notes}
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={() => viewBookingDetails(booking)}
                            variant="outline"
                            className="w-full"
                          >
                            View Details
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">
                    {format(new Date(selectedBooking.date), "MMMM d, yyyy")}
                  </h3>
                  <p className="text-sm text-muted-foreground">{timeSlots[selectedBooking.attendees || 0]}</p>
                </div>
                <Badge className={`bg-${statusColors[selectedBooking.status || "pending"]}`}>
                  {selectedBooking.status}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {getUserName(selectedBooking.userId).substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{getUserName(selectedBooking.userId)}</p>
                    <p className="text-xs text-muted-foreground">Customer</p>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-3">
                <p className="text-sm font-medium mb-1">Location</p>
                <p className="text-sm">{selectedBooking.location}</p>
              </div>

              <div className="space-y-3">
                <Label htmlFor="status">Update Status</Label>
                <Select value={updateStatus} onValueChange={setUpdateStatus}>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this booking"
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter className="flex space-x-2 justify-between">
              <Button
                variant="outline"
                onClick={() => setIsDetailsOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateBooking}
                disabled={updateBookingMutation.isPending}
              >
                {updateBookingMutation.isPending ? (
                  <>
                    <div className="loader mr-2 h-4 w-4 border-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Booking"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}