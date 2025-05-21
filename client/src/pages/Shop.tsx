import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { ProductGrid } from "@/components/products/ProductGrid";
import { ProductFilters } from "@/components/products/ProductFilters";

export default function Shop() {
  const [location] = useLocation();
  const [categoryId, setCategoryId] = useState<number | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [priceRange, setPriceRange] = useState<[number, number] | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);

  // Parse query params when page loads
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    const category = params.get("category");
    if (category) setCategoryId(parseInt(category));
    
    const search = params.get("search");
    if (search) setSearchQuery(search);
  }, [location]);

  const handleFilterChange = (filters: {
    category?: number;
    search?: string;
    priceRange?: [number, number];
    sort?: string;
  }) => {
    setCategoryId(filters.category);
    setSearchQuery(filters.search);
    setPriceRange(filters.priceRange);
    setSortBy(filters.sort);
    
    // Update URL with filters (could be enhanced further)
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category.toString());
    if (filters.search) params.append("search", filters.search);
    
    // We don't update URL with price range and sort to avoid cluttering
    // For a full implementation, you might want to include these as well
    
    const newSearch = params.toString() ? `?${params.toString()}` : "";
    window.history.replaceState(null, "", `${window.location.pathname}${newSearch}`);
  };

  return (
    <>
      <Helmet>
        <title>Shop | Cleopatra Eyewear Collection</title>
        <meta name="description" content="Browse our collection of premium eyewear, including sunglasses, optical frames, and blue light glasses. Find your perfect style with Cleopatra Eyewear." />
      </Helmet>
      
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 font-poppins">Shop Eyewear</h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Discover our collection of premium eyewear designed for style and comfort.
          </p>
        </div>
        
        {/* Filters */}
        <ProductFilters
          onFilterChange={handleFilterChange}
          initialCategoryId={categoryId}
        />
        
        {/* Product Grid */}
        <ProductGrid
          categoryId={categoryId}
          searchQuery={searchQuery}
          priceRange={priceRange}
          sortBy={sortBy}
        />
      </div>
    </>
  );
}
