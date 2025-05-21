import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Feedback, Booking, User } from "@shared/schema";

// Components
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth-context";

// Icons
import { StarIcon, Search, MessageSquare, User as UserIcon, Calendar } from "lucide-react";

export default function StaffFeedback() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Get all feedback
  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ["feedback"],
    queryFn: async () => {
      const res = await fetch("/api/feedback");
      if (!res.ok) throw new Error("Failed to fetch feedback");
      return res.json();
    },
  });

  // Get all bookings for reference
  const { data: bookings = {} } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const res = await fetch("/api/bookings");
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const bookingsArray = await res.json();
      // Convert to object with booking ID as key for easier lookup
      return bookingsArray.reduce((acc: Record<number, Booking>, b: Booking) => {
        acc[b.id] = b;
        return acc;
      }, {});
    },
  });

  // Get all users for reference
  const { data: users = {} } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const usersArray = await res.json();
      // Convert to object with user ID as key for easier lookup
      return usersArray.reduce((acc: Record<number, User>, u: User) => {
        acc[u.id] = u;
        return acc;
      }, {});
    },
  });

  // Sort and filter feedback
  const filteredFeedback = [...feedback]
    .filter((item: Feedback) => {
      if (!searchQuery) return true;
      
      const booking = bookings[item.bookingId || 0];
      const user = users[item.userId || 0];
      
      const userMatch = user?.username?.toLowerCase().includes(searchQuery.toLowerCase());
      const commentMatch = item.comment?.toLowerCase().includes(searchQuery.toLowerCase());
      const locationMatch = booking?.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return userMatch || commentMatch || locationMatch;
    })
    .sort((a: Feedback, b: Feedback) => {
      const dateA = new Date(a.createdAt || new Date());
      const dateB = new Date(b.createdAt || new Date());
      
      if (sortOrder === "newest") {
        return dateB.getTime() - dateA.getTime();
      } else if (sortOrder === "oldest") {
        return dateA.getTime() - dateB.getTime();
      } else if (sortOrder === "highest") {
        return b.rating - a.rating;
      } else if (sortOrder === "lowest") {
        return a.rating - b.rating;
      }
      return 0;
    });

  // View feedback details
  const viewFeedbackDetails = (feedbackItem: Feedback) => {
    setSelectedFeedback(feedbackItem);
    setIsViewOpen(true);
  };

  // Render stars based on rating
  const renderStars = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <StarIcon
          key={i}
          className={`h-4 w-4 ${
            i < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
          }`}
        />
      ));
  };

  return (
    <>
      <Helmet>
        <title>Feedback | Cleopatra Eyewear</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">Customer Feedback</h1>
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search feedback..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Feedback Cards */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="loader w-8 h-8 rounded-full border-4 border-muted"></div>
          </div>
        ) : filteredFeedback.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-lg">
            <MessageSquare className="mx-auto h-12 w-12 text-muted" />
            <h3 className="mt-4 text-lg font-medium">No feedback found</h3>
            <p className="mt-2 text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms" : "There are no feedback submissions yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredFeedback.map((item: Feedback) => {
              const booking = bookings[item.bookingId || 0];
              const user = users[item.userId || 0];
              
              return (
                <Card key={item.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/10 pb-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {user?.username?.substring(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-md">{user?.username || "Unknown user"}</CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {item.createdAt ? format(new Date(item.createdAt), "MMM d, yyyy") : "Unknown date"}
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        {renderStars(item.rating)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {booking && (
                      <div className="text-sm text-muted-foreground mb-2">
                        Appointment at {booking.location} on {booking.date ? format(new Date(booking.date), "MMM d, yyyy") : "Unknown date"}
                      </div>
                    )}
                    <p className="line-clamp-3">
                      {item.comment || "No comment provided"}
                    </p>
                    {item.comment && item.comment.length > 150 && (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto mt-1 text-primary"
                        onClick={() => viewFeedbackDetails(item)}
                      >
                        Read more
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Feedback Details Dialog */}
      {selectedFeedback && (
        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Feedback Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {users[selectedFeedback.userId || 0]?.username?.substring(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{users[selectedFeedback.userId || 0]?.username || "Unknown user"}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedFeedback.createdAt 
                        ? format(new Date(selectedFeedback.createdAt), "MMMM d, yyyy")
                        : "Unknown date"}
                    </p>
                  </div>
                </div>
                <div className="flex">
                  {renderStars(selectedFeedback.rating)}
                </div>
              </div>
              
              {bookings[selectedFeedback.bookingId || 0] && (
                <div className="border rounded-md p-3 bg-muted/10">
                  <h4 className="text-sm font-medium mb-1">Appointment Details</h4>
                  <p className="text-sm">
                    Location: {bookings[selectedFeedback.bookingId || 0]?.location || "Unknown location"}
                  </p>
                  <p className="text-sm">
                    Date: {bookings[selectedFeedback.bookingId || 0]?.date 
                        ? format(new Date(bookings[selectedFeedback.bookingId || 0]?.date), "MMMM d, yyyy")
                        : "Unknown date"}
                  </p>
                  <p className="text-sm">
                    Status: <Badge>{bookings[selectedFeedback.bookingId || 0]?.status || "Unknown"}</Badge>
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="text-sm font-medium mb-2">Comment</h4>
                <div className="bg-accent/10 p-3 rounded-md">
                  <p>{selectedFeedback.comment || "No comment provided"}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsViewOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}