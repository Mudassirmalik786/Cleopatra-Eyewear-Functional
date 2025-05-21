import { Icons } from "@/components/ui/icons";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  rating: number;
  comment: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Loyal Customer",
    rating: 5,
    comment: "The mobile caravan experience was incredible! The team helped me find the perfect pair of glasses that I've been receiving compliments on ever since."
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Satisfied Customer",
    rating: 5,
    comment: "The quality of Cleopatra's eyewear is exceptional. I've purchased multiple pairs and they've held up beautifully. Customer service is top-notch too!"
  },
  {
    id: 3,
    name: "Alex Rodriguez",
    role: "HR Manager",
    rating: 4.5,
    comment: "I booked the caravan for our corporate wellness day and it was a hit! Everyone appreciated the convenience and professional service right at our office."
  }
];

export function Testimonials() {
  // Helper function to render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Icons.star key={`full-${i}`} className="h-5 w-5" />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <Icons.starHalf key="half" className="h-5 w-5" />
      );
    }
    
    // Add empty stars to make 5 total
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Icons.starEmpty key={`empty-${i}`} className="h-5 w-5" />
      );
    }
    
    return stars;
  };

  return (
    <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Testimonials</span>
          <h2 className="text-3xl font-bold mt-2 font-poppins">What Our Customers Say</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white dark:bg-neutral-800 p-6 rounded-xl shadow-sm">
              <div className="flex text-amber-400 mb-4">
                {renderStars(testimonial.rating)}
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 italic mb-6">"{testimonial.comment}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden mr-4">
                  <div className="w-full h-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary">
                    <Icons.user className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-neutral-800 dark:text-neutral-200">{testimonial.name}</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
