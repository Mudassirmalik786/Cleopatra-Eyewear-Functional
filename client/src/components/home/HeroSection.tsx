import { Link } from "wouter";

export function HeroSection() {
  return (
    <section className="relative bg-primary overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-90"></div>
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 text-white mb-8 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins leading-tight">
              Discover Your Perfect Style
            </h1>
            <p className="text-lg md:text-xl mb-8 text-primary-100 max-w-lg">
              Elevate your look with our premium eyewear collection, designed for comfort and style.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/shop">
                <a className="inline-block bg-white text-primary font-medium py-3 px-6 rounded-lg hover:bg-primary-50 transition-all">
                  Shop Collection
                </a>
              </Link>
              <Link href="/book-caravan">
                <a className="inline-block bg-transparent text-white border border-white font-medium py-3 px-6 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all">
                  Book Caravan
                </a>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
              alt="Model wearing stylish eyeglasses"
              className="rounded-lg shadow-lg max-w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
