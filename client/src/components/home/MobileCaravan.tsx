import { Link } from "wouter";
import { Icons } from "@/components/ui/icons";

export function MobileCaravan() {
  return (
    <section id="book" className="py-16 bg-white dark:bg-neutral-900">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0 lg:pr-12">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">
              Exclusive Service
            </span>
            <h2 className="text-3xl font-bold mt-2 mb-6 font-poppins">
              Mobile Eyewear Caravan
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
              Experience our unique mobile eyewear service that brings our collection directly to you. 
              Perfect for corporate events, private parties, or community gatherings.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <Icons.check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-neutral-700 dark:text-neutral-300">
                  Professional eye consultations
                </span>
              </li>
              <li className="flex items-start">
                <Icons.check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-neutral-700 dark:text-neutral-300">
                  Try our complete collection on-site
                </span>
              </li>
              <li className="flex items-start">
                <Icons.check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-neutral-700 dark:text-neutral-300">
                  Personalized style recommendations
                </span>
              </li>
              <li className="flex items-start">
                <Icons.check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-neutral-700 dark:text-neutral-300">
                  Convenient booking and flexible scheduling
                </span>
              </li>
            </ul>
            <Link href="/book-caravan">
              <a className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all">
                Book Caravan Now
              </a>
            </Link>
          </div>
          
          <div className="w-full lg:w-1/2">
            <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/10 rounded-lg shadow-lg p-8 w-full">
              <svg
                viewBox="0 0 400 300"
                className="w-full h-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Van body */}
                <rect
                  x="50"
                  y="150"
                  width="300"
                  height="100"
                  rx="10"
                  fill="#8B5CF6"
                  className="drop-shadow-lg"
                />
                
                {/* Van front */}
                <rect
                  x="320"
                  y="130"
                  width="60"
                  height="120"
                  rx="10"
                  fill="#7C3AED"
                />
                
                {/* Windshield */}
                <rect
                  x="330"
                  y="140"
                  width="40"
                  height="50"
                  rx="5"
                  fill="#E0E7FF"
                  opacity="0.8"
                />
                
                {/* Side window */}
                <rect
                  x="270"
                  y="160"
                  width="40"
                  height="30"
                  rx="3"
                  fill="#E0E7FF"
                  opacity="0.8"
                />
                
                {/* Wheels */}
                <circle cx="100" cy="270" r="25" fill="#374151" />
                <circle cx="100" cy="270" r="15" fill="#6B7280" />
                <circle cx="280" cy="270" r="25" fill="#374151" />
                <circle cx="280" cy="270" r="15" fill="#6B7280" />
                
                {/* Door handle */}
                <circle cx="240" cy="200" r="3" fill="#FCD34D" />
                
                {/* Van text/logo */}
                <text
                  x="160"
                  y="200"
                  fontSize="16"
                  fill="white"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  CLEOPATRA
                </text>
                <text
                  x="160"
                  y="220"
                  fontSize="12"
                  fill="white"
                  textAnchor="middle"
                >
                  EYEWEAR
                </text>
                
                {/* Glasses icons on van */}
                <g transform="translate(80, 170)">
                  <ellipse cx="0" cy="0" rx="12" ry="8" fill="none" stroke="white" strokeWidth="2" />
                  <ellipse cx="25" cy="0" rx="12" ry="8" fill="none" stroke="white" strokeWidth="2" />
                  <line x1="12" y1="0" x2="13" y2="0" stroke="white" strokeWidth="2" />
                </g>
                
                {/* Background elements */}
                <circle cx="80" cy="80" r="30" fill="#FCD34D" opacity="0.3" />
                <circle cx="320" cy="60" r="20" fill="#F97316" opacity="0.3" />
                
                {/* Mobile service text */}
                <text
                  x="200"
                  y="40"
                  fontSize="18"
                  fill="#7C3AED"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  Mobile Eyewear Service
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
