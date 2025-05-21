import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { AuthModal } from "@/components/auth/AuthModal";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { useAuth } from "@/hooks/auth-context";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authType, setAuthType] = useState<"login" | "register">("login");
  const { user, isLoading, logout } = useAuth();

  const openLoginModal = () => {
    setAuthType("login");
    setAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthType("register");
    setAuthModalOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-neutral-900 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary font-poppins">Cleopatra</span>
            <span className="ml-1 text-lg font-light text-primary-400 font-poppins">Eyewear</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="font-medium text-primary border-b-2 border-primary pb-1">
              Home
            </Link>
            <Link href="/shop" className="font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary transition-all">
              Shop
            </Link>
            <Link href="/book-caravan" className="font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary transition-all">
              Book Caravan
            </Link>
            <Link href="/about" className="font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary transition-all">
              About
            </Link>
            <Link href="/contact" className="font-medium text-neutral-600 dark:text-neutral-300 hover:text-primary transition-all">
              Contact
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Icons.search className="h-5 w-5 text-neutral-600 dark:text-neutral-300 hover:text-primary transition-all" />
            </Button>
            <Button variant="ghost" size="icon">
              <Icons.cart className="h-5 w-5 text-neutral-600 dark:text-neutral-300 hover:text-primary transition-all" />
            </Button>

            {isLoading ? (
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            ) : user ? (
              <div className="relative group">
                <Button variant="ghost" size="icon" asChild>
                  <Link href="/profile">
                    <Icons.user className="h-5 w-5 text-neutral-600 dark:text-neutral-300 hover:text-primary transition-all" />
                  </Link>
                </Button>
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-md shadow-lg py-1 hidden group-hover:block">
                  <Link href="/profile" className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                    Profile
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                      Admin Dashboard
                    </Link>
                  )}
                  {user.role === "staff" && (
                    <Link href="/staff/dashboard" className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                      Staff Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={openLoginModal}>
                <Icons.user className="h-5 w-5 text-neutral-600 dark:text-neutral-300 hover:text-primary transition-all" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Icons.menu className="h-6 w-6 text-neutral-600 dark:text-neutral-300" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
        onLogin={openLoginModal}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        type={authType}
        onSwitchType={(type) => setAuthType(type)}
      />
    </header>
  );
}
