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
            <img
              src="https://images.unsplash.com/photo-1595870811392-1238aabcf945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
              alt="Eyewear mobile caravan"
              className="rounded-lg shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
