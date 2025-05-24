import { Helmet } from "react-helmet";
import { Heart, Star, Truck, Eye } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <Helmet>
        <title>About Us - Cleopatra Eyewear Collection</title>
        <meta name="description" content="Learn about Cleopatra Eyewear Collection's mission to provide premium eyewear with exceptional service and mobile caravan convenience." />
      </Helmet>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 font-poppins">
            About Cleopatra Eyewear
          </h1>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
            Where elegance meets vision. We bring premium eyewear directly to you with our revolutionary mobile caravan service.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-6">Our Story</h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-4">
              Founded with a passion for combining luxury eyewear with unparalleled convenience, 
              Cleopatra Eyewear Collection revolutionizes how you shop for glasses.
            </p>
            <p className="text-neutral-600 dark:text-neutral-300 mb-4">
              Our mobile caravan service brings a complete eyewear boutique experience directly 
              to your location, whether it's your home, office, or event venue.
            </p>
            <p className="text-neutral-600 dark:text-neutral-300">
              We believe that finding the perfect frames should be as elegant and effortless 
              as wearing them.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-8">
            <Eye className="w-24 h-24 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-center text-primary">Premium Quality</h3>
            <p className="text-center text-neutral-600 dark:text-neutral-300 mt-2">
              Every frame is carefully selected for quality, style, and comfort
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-primary text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Customer First</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                Your satisfaction and comfort are our top priorities in every interaction.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Excellence</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                We maintain the highest standards in product quality and service delivery.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                Our mobile caravan service represents the future of personalized shopping.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-primary mb-8">Our Team</h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
            Our experienced opticians and style consultants are dedicated to helping you 
            find the perfect eyewear that combines fashion, function, and comfort.
          </p>
        </div>
      </div>
    </div>
  );
}