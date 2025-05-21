import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductGridProps {
  categoryId?: number;
  searchQuery?: string;
  priceRange?: [number, number];
  sortBy?: string;
}

export function ProductGrid({ categoryId, searchQuery, priceRange, sortBy }: ProductGridProps) {
  // Construct query string based on filters
  const queryParams = new URLSearchParams();
  if (categoryId) queryParams.append("categoryId", categoryId.toString());
  
  // We're using the query key array format for proper cache invalidation
  const queryKey = ["/api/products"];
  if (categoryId) queryKey.push({ categoryId });
  
  const { data: products, isLoading, error } = useQuery<Product[]>({
    queryKey,
  });
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-neutral-600 dark:text-neutral-400">
          Failed to load products. Please try again later.
        </p>
      </div>
    );
  }

  // Apply client-side filtering based on search query and price range
  let filteredProducts = products || [];
  
  if (searchQuery && searchQuery.trim() !== "") {
    const query = searchQuery.toLowerCase();
    filteredProducts = filteredProducts.filter(product => 
      product.name.toLowerCase().includes(query) || 
      (product.description && product.description.toLowerCase().includes(query))
    );
  }
  
  if (priceRange) {
    const [min, max] = priceRange;
    filteredProducts = filteredProducts.filter(product => 
      product.price >= min * 100 && product.price <= max * 100
    );
  }
  
  // Apply sorting
  if (sortBy) {
    switch(sortBy) {
      case "price-asc":
        filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filteredProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filteredProducts = [...filteredProducts].sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // No sorting or "newest" (default sort)
        break;
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {isLoading ? (
        // Loading skeletons
        Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden">
            <Skeleton className="h-64 w-full" />
            <div className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/4 mb-4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
        ))
      ) : filteredProducts.length > 0 ? (
        filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <div className="col-span-full text-center py-10">
          <p className="text-neutral-600 dark:text-neutral-400">
            No products found matching your criteria. Try adjusting your filters.
          </p>
        </div>
      )}
    </div>
  );
}
