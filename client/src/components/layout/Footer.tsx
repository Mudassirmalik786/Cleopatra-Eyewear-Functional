import { Link } from "wouter";
import { Icons } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="bg-neutral-800 text-neutral-300 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <span className="text-2xl font-bold text-white font-poppins">Cleopatra</span>
              <span className="ml-1 text-lg font-light text-primary-300 font-poppins">Eyewear</span>
            </div>
            <p className="mb-6 text-neutral-400 max-w-md">
              Bringing elegance and style to eyewear since 2010. Our mission is to help you find the perfect frames that complement your unique style.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-400 hover:text-primary-300 transition-all">
                <Icons.facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-300 transition-all">
                <Icons.instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-300 transition-all">
                <Icons.twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-300 transition-all">
                <Icons.pinterest className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="hover:text-primary-300 transition-all">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/shop">
                  <a className="hover:text-primary-300 transition-all">Shop</a>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <a className="hover:text-primary-300 transition-all">About Us</a>
                </Link>
              </li>
              <li>
                <Link href="/book-caravan">
                  <a className="hover:text-primary-300 transition-all">Book Caravan</a>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <a className="hover:text-primary-300 transition-all">Contact</a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Help */}
          <div>
            <h4 className="text-white font-medium text-lg mb-4">Help</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faq">
                  <a className="hover:text-primary-300 transition-all">FAQs</a>
                </Link>
              </li>
              <li>
                <Link href="/shipping">
                  <a className="hover:text-primary-300 transition-all">Shipping Info</a>
                </Link>
              </li>
              <li>
                <Link href="/returns">
                  <a className="hover:text-primary-300 transition-all">Returns & Exchanges</a>
                </Link>
              </li>
              <li>
                <Link href="/payment">
                  <a className="hover:text-primary-300 transition-all">Payment Methods</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy">
                  <a className="hover:text-primary-300 transition-all">Privacy Policy</a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-white font-medium text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Icons.mapPin className="text-primary-300 h-5 w-5 mt-1 mr-2" />
                <span>123 Eyewear Ave, Fashion District, NY 10001</span>
              </li>
              <li className="flex items-start">
                <Icons.phone className="text-primary-300 h-5 w-5 mt-1 mr-2" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start">
                <Icons.mail className="text-primary-300 h-5 w-5 mt-1 mr-2" />
                <span>contact@cleopatraeyewear.com</span>
              </li>
              <li className="flex items-start">
                <Icons.time className="text-primary-300 h-5 w-5 mt-1 mr-2" />
                <span>Mon-Fri: 9AM-6PM, Sat: 10AM-4PM</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-neutral-700 text-sm text-neutral-500 flex flex-col md:flex-row justify-between items-center">
          <p>&copy; {new Date().getFullYear()} Cleopatra Eyewear Collection. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/terms">
              <a className="hover:text-primary-300 transition-all">Terms of Service</a>
            </Link>
            <Link href="/privacy">
              <a className="hover:text-primary-300 transition-all">Privacy Policy</a>
            </Link>
            <Link href="/sitemap">
              <a className="hover:text-primary-300 transition-all">Sitemap</a>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
