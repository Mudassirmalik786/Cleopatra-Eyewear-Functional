import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Icons } from "@/components/ui/icons";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function MobileMenu({ isOpen, onClose, onLogin }: MobileMenuProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality
      console.log("Searching for:", searchQuery);
    }
    // Close the menu after search
    onClose();
  };

  return (
    <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-neutral-900 h-full w-4/5 max-w-sm overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b dark:border-neutral-800">
          <div className="flex items-center">
            <span className="text-xl font-bold text-primary font-poppins">Cleopatra</span>
            <span className="ml-1 text-md font-light text-primary-400 font-poppins">Eyewear</span>
          </div>
          <button 
            className="text-neutral-600 dark:text-neutral-400 hover:text-primary"
            onClick={onClose}
          >
            <Icons.close className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full py-2 pl-3 pr-10 border rounded-lg dark:bg-neutral-800 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-3 top-2.5 text-neutral-400"
              >
                <Icons.search className="h-5 w-5" />
              </button>
            </div>
          </form>

          <nav className="flex flex-col space-y-3">
            <Link href="/">
              <a 
                className={`font-medium py-2 ${
                  location === "/" 
                    ? "text-primary" 
                    : "text-neutral-600 dark:text-neutral-300 hover:text-primary"
                }`}
                onClick={onClose}
              >
                Home
              </a>
            </Link>
            <Link href="/shop">
              <a 
                className={`font-medium py-2 ${
                  location === "/shop" 
                    ? "text-primary" 
                    : "text-neutral-600 dark:text-neutral-300 hover:text-primary"
                }`}
                onClick={onClose}
              >
                Shop
              </a>
            </Link>
            <Link href="/book-caravan">
              <a 
                className={`font-medium py-2 ${
                  location === "/book-caravan" 
                    ? "text-primary" 
                    : "text-neutral-600 dark:text-neutral-300 hover:text-primary"
                }`}
                onClick={onClose}
              >
                Book Caravan
              </a>
            </Link>
            <Link href="/about">
              <a 
                className={`font-medium py-2 ${
                  location === "/about" 
                    ? "text-primary" 
                    : "text-neutral-600 dark:text-neutral-300 hover:text-primary"
                }`}
                onClick={onClose}
              >
                About
              </a>
            </Link>
            <Link href="/contact">
              <a 
                className={`font-medium py-2 ${
                  location === "/contact" 
                    ? "text-primary" 
                    : "text-neutral-600 dark:text-neutral-300 hover:text-primary"
                }`}
                onClick={onClose}
              >
                Contact
              </a>
            </Link>
          </nav>

          <div className="mt-6 pt-6 border-t dark:border-neutral-800">
            <button
              className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all"
              onClick={() => {
                onClose();
                onLogin();
              }}
            >
              Login / Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
