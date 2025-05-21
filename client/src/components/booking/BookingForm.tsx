import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Icons } from "@/components/ui/icons";
import { format } from "date-fns";

// Schema for the booking form
const bookingSchema = z.object({
  date: z.date({
    required_error: "Please select a date for your booking",
  }).refine(
    (date) => date > new Date(Date.now() + 24 * 60 * 60 * 1000), 
    { message: "Booking must be at least 24 hours in advance" }
  ),
  location: z.string().min(10, { message: "Location must be at least 10 characters" }),
  attendees: z.number().min(1, { message: "Number of attendees must be at least 1" }).max(50, { message: "Maximum 50 attendees allowed" }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  onSuccess?: () => void;
}

export function BookingForm({ onSuccess }: BookingFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [timeSelected, setTimeSelected] = useState<string>("12:00");
  
  // Default values for the form
  const defaultValues: Partial<BookingFormValues> = {
    date: undefined,
    location: "",
    attendees: 1,
    notes: "",
  };

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues,
  });

  // Mutation for creating a booking
  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      // Combine date and time
      const selectedDate = new Date(data.date);
      const [hours, minutes] = timeSelected.split(':').map(Number);
      selectedDate.setHours(hours, minutes);
      
      const response = await apiRequest("POST", "/api/bookings", {
        date: selectedDate.toISOString(),
        location: data.location,
        attendees: data.attendees,
        notes: data.notes || "",
        status: "pending", // Default status
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Request Submitted",
        description: "We'll contact you shortly to confirm your booking.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      form.reset(defaultValues);
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create booking",
        description: error.message || "Please try again later.",
      });
    },
  });

  function onSubmit(data: BookingFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to book the caravan.",
      });
      return;
    }
    
    createBookingMutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Date picker */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`w-full pl-3 text-left font-normal ${
                        !field.value && "text-muted-foreground"
                      }`}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <Icons.time className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => 
                      date < new Date(Date.now() + 24 * 60 * 60 * 1000) || // Disable dates less than 24 hours from now
                      date > new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Disable dates more than 90 days in the future
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select a date for your caravan visit (at least 24 hours in advance).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Time selection */}
        <div className="space-y-2">
          <FormLabel>Time</FormLabel>
          <select
            value={timeSelected}
            onChange={(e) => setTimeSelected(e.target.value)}
            className="w-full p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="09:00">9:00 AM</option>
            <option value="10:00">10:00 AM</option>
            <option value="11:00">11:00 AM</option>
            <option value="12:00">12:00 PM</option>
            <option value="13:00">1:00 PM</option>
            <option value="14:00">2:00 PM</option>
            <option value="15:00">3:00 PM</option>
            <option value="16:00">4:00 PM</option>
            <option value="17:00">5:00 PM</option>
          </select>
          <FormDescription>
            Select a time for your appointment. Our operating hours are 9 AM to 5 PM.
          </FormDescription>
        </div>

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Enter the address for your caravan visit" {...field} />
              </FormControl>
              <FormDescription>
                Provide a complete address where you'd like the mobile caravan to visit.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Number of attendees */}
        <FormField
          control={form.control}
          name="attendees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Attendees</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  max={50} 
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Approximately how many people will be at the event?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Additional notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Any special requests or information we should know?" 
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Let us know any special requirements or questions you have.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          disabled={createBookingMutation.isPending}
          className="w-full md:w-auto bg-primary hover:bg-primary-dark"
        >
          {createBookingMutation.isPending ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent"></div>
              Submitting...
            </>
          ) : (
            "Submit Booking Request"
          )}
        </Button>
      </form>
    </Form>
  );
}
