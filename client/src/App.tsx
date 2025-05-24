import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import BookCaravan from "@/pages/BookCaravan";
import Profile from "@/pages/Profile";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Checkout from "@/pages/Checkout";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminBookings from "@/pages/admin/Bookings";
import AdminUsers from "@/pages/admin/Users";

// Staff Pages
import StaffDashboard from "@/pages/staff/Dashboard";
import StaffBookings from "@/pages/staff/Bookings";
import StaffFeedback from "@/pages/staff/Feedback";

import { AuthProvider } from "@/hooks/auth-context";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Switch>
          {/* Customer Pages */}
          <Route path="/" component={Home} />
          <Route path="/shop" component={Shop} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/book-caravan" component={BookCaravan} />
          <Route path="/profile" component={Profile} />
          <Route path="/about" component={About} />
          <Route path="/contact" component={Contact} />
          
          {/* Admin Pages */}
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/bookings" component={AdminBookings} />
          <Route path="/admin/users" component={AdminUsers} />
          
          {/* Staff Pages */}
          <Route path="/staff/dashboard" component={StaffDashboard} />
          <Route path="/staff/bookings" component={StaffBookings} />
          <Route path="/staff/feedback" component={StaffFeedback} />
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
