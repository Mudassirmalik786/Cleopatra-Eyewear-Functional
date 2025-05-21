import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Category } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedCategories() {
  const { data: categories, isLoading, error } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  if (error) {
    return (
      <section className="py-16 bg-white dark:bg-neutral-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6 font-poppins">Shop By Category</h2>
          <div className="text-center text-neutral-600 dark:text-neutral-400">
            Failed to load categories. Please try again later.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white dark:bg-neutral-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 font-poppins">Shop By Category</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="relative rounded-lg overflow-hidden">
                <Skeleton className="h-64 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories?.slice(0, 3).map((category) => (
              <Link key={category.id} href={`/shop?category=${category.id}`}>
                <a className="group relative overflow-hidden rounded-lg shadow-md cursor-pointer">
                  <img
                    src={category.imageUrl}
                    alt={category.name}
                    className="w-full h-64 object-cover transition-all duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                    <div className="p-6 w-full">
                      <h3 className="text-white text-xl font-medium mb-2">{category.name}</h3>
                      <div className="w-0 group-hover:w-full h-0.5 bg-primary-300 transition-all duration-300"></div>
                    </div>
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
