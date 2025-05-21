import { Helmet } from "react-helmet";
import { BookingForm } from "@/components/booking/BookingForm";
import { Icons } from "@/components/ui/icons";

export default function BookCaravan() {
  return (
    <>
      <Helmet>
        <title>Book Mobile Caravan | Cleopatra Eyewear Collection</title>
        <meta name="description" content="Book our mobile eyewear caravan for your event. Bring the Cleopatra Eyewear experience directly to your location with our unique mobile service." />
      </Helmet>
      
      <div className="container mx-auto py-12 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 font-poppins">Mobile Eyewear Caravan Booking</h1>
          <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Book our unique mobile eyewear service that brings our collection directly to you. 
            Perfect for corporate events, private parties, or community gatherings.
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Booking Form */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-6 font-poppins">Request a Booking</h2>
              <BookingForm />
            </div>
          </div>
          
          {/* Caravan Info */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm mb-8">
              <h2 className="text-xl font-bold mb-4 font-poppins">What to Expect</h2>
              <ul className="space-y-4">
                <li className="flex">
                  <Icons.check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Professional Eye Consultations</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Our trained staff will provide personalized consultations and recommendations.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <Icons.check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Complete Collection Access</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Browse and try our extensive range of eyewear products on-site.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <Icons.check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Style Recommendations</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Get expert advice on frames that best suit your face shape and style preferences.
                    </p>
                  </div>
                </li>
                <li className="flex">
                  <Icons.check className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Convenient Ordering</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Place orders directly from the caravan with options for delivery or pickup.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-bold mb-4 font-poppins">Booking Information</h2>
              <div className="space-y-4">
                <div className="flex">
                  <Icons.time className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Availability</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Our caravan is available Monday through Saturday, 9 AM to 5 PM.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <Icons.mapPin className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Service Area</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      We currently serve within a 30-mile radius of the city center.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <Icons.user className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Group Size</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Our mobile caravan can accommodate groups of up to 50 people.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <Icons.mail className="h-5 w-5 text-primary mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium">Additional Questions?</h3>
                    <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                      Contact us at <a href="mailto:caravan@cleopatraeyewear.com" className="text-primary hover:underline">caravan@cleopatraeyewear.com</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
