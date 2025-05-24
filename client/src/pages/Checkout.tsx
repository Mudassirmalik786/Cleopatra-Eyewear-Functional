import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ items, total }: { items: any[], total: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/payment-success',
      },
    });

    setIsProcessing(false);

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
      setLocation('/');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <hr className="my-4" />
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        <PaymentElement />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary-dark" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <div className="flex items-center">
            <Icons.loader className="animate-spin mr-2 h-4 w-4" />
            Processing Payment...
          </div>
        ) : (
          `Pay $${total.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Get cart items from localStorage or URL params
    const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cartItems.length === 0) {
      setLocation('/shop');
      return;
    }

    setItems(cartItems);
    const cartTotal = cartItems.reduce((sum: number, item: any) => 
      sum + (item.price * item.quantity), 0
    );
    setTotal(cartTotal);

    // Create PaymentIntent as soon as the page loads
    apiRequest("POST", "/api/create-payment-intent", { 
      items: cartItems, 
      amount: cartTotal 
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error('Payment intent error:', error);
        setLocation('/shop');
      });
  }, [setLocation]);

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p>Setting up your payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Checkout</h1>
          <p className="text-center text-neutral-600 dark:text-neutral-400">
            Complete your eyewear purchase
          </p>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm items={items} total={total} />
        </Elements>

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => setLocation('/shop')}
          >
            ← Back to Shop
          </Button>
        </div>
      </div>
    </div>
  );
}