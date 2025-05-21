import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        variant: "destructive",
        title: "Email is required",
        description: "Please enter your email address."
      });
      return;
    }
    
    setIsLoading(true);
    
    // Simulate subscription - in a real app, this would call an API
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Subscription successful!",
        description: "Thank you for subscribing to our newsletter."
      });
      setEmail("");
    }, 1000);
  };

  return (
    <section className="py-16 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 font-poppins">Stay Updated</h2>
          <p className="mb-8 text-primary-100">
            Subscribe to our newsletter for the latest collections, exclusive offers, and eyewear trends.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="email"
              placeholder="Your email address"
              className="flex-grow py-3 px-4 rounded-lg text-neutral-800 dark:text-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button 
              type="submit" 
              className="bg-white text-primary font-medium py-3 px-6 rounded-lg hover:bg-primary-50 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  Subscribing...
                </>
              ) : (
                "Subscribe"
              )}
            </Button>
          </form>
          
          <p className="mt-4 text-sm text-primary-200">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
          </p>
        </div>
      </div>
    </section>
  );
}
