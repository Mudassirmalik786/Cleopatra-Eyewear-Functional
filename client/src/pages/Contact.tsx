import { useState } from "react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, Truck, Calendar, Eye, Loader, Send } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      form.reset();
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <Helmet>
        <title>Contact Us - Cleopatra Eyewear Collection</title>
        <meta name="description" content="Get in touch with Cleopatra Eyewear Collection. Book a consultation, ask questions, or request our mobile caravan service." />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 font-poppins">
            Contact Us
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Ready to find your perfect eyewear? Get in touch with our team to book a consultation or learn more about our services.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold text-primary mb-8">Get In Touch</h2>
            
            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Phone</h3>
                  <p className="text-neutral-600 dark:text-neutral-300">+1 (555) 123-4567</p>
                  <p className="text-sm text-neutral-500">Mon-Fri: 9AM-6PM, Sat: 10AM-4PM</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email</h3>
                  <p className="text-neutral-600 dark:text-neutral-300">info@cleopatraeyewear.com</p>
                  <p className="text-sm text-neutral-500">We respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Service Area</h3>
                  <p className="text-neutral-600 dark:text-neutral-300">Greater Metropolitan Area</p>
                  <p className="text-sm text-neutral-500">Mobile caravan service available</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Mobile Service</h3>
                  <p className="text-neutral-600 dark:text-neutral-300">We come to you!</p>
                  <p className="text-sm text-neutral-500">Book our mobile caravan consultation</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <a href="/book-caravan">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Mobile Caravan
                  </a>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start">
                  <a href="/shop">
                    <Eye className="w-4 h-4 mr-2" />
                    Browse Eyewear
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-primary mb-6">Send us a Message</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject *</FormLabel>
                      <FormControl>
                        <Input placeholder="What can we help you with?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Tell us more about your eyewear needs or questions..."
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}