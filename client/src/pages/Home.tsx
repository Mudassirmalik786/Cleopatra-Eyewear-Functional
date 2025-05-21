import { Helmet } from "react-helmet";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { MobileCaravan } from "@/components/home/MobileCaravan";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";

export default function Home() {
  return (
    <>
      <Helmet>
        <title>Cleopatra Eyewear Collection | Premium Glasses & Sunglasses</title>
        <meta name="description" content="Discover premium eyewear at Cleopatra Eyewear Collection. Shop stylish glasses, sunglasses, and book our mobile eyewear caravan for your event." />
        {/* Open Graph tags */}
        <meta property="og:title" content="Cleopatra Eyewear Collection | Premium Glasses & Sunglasses" />
        <meta property="og:description" content="Discover premium eyewear at Cleopatra Eyewear Collection. Shop stylish glasses, sunglasses, and book our mobile eyewear caravan for your event." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://cleopatraeyewear.com" />
        <meta property="og:image" content="https://images.unsplash.com/photo-1577803645773-f96470509666?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" />
      </Helmet>
      
      <HeroSection />
      <FeaturedCategories />
      <FeaturedProducts />
      <MobileCaravan />
      <Testimonials />
      <Newsletter />
    </>
  );
}
