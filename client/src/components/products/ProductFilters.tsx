import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Icons } from "@/components/ui/icons";

interface ProductFiltersProps {
  onFilterChange: (filters: {
    category?: number;
    search?: string;
    priceRange?: [number, number];
    sort?: string;
  }) => void;
  initialCategoryId?: number;
}

export function ProductFilters({ onFilterChange, initialCategoryId }: ProductFiltersProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(initialCategoryId);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortOption, setSortOption] = useState("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Apply filters when they change
  useEffect(() => {
    onFilterChange({
      category: selectedCategory,
      search: searchTerm,
      priceRange,
      sort: sortOption,
    });
  }, [selectedCategory, searchTerm, priceRange, sortOption, onFilterChange]);

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({
      category: selectedCategory,
      search: searchTerm,
      priceRange,
      sort: sortOption,
    });
  };

  const clearFilters = () => {
    setSelectedCategory(undefined);
    setSearchTerm("");
    setPriceRange([0, 500]);
    setSortOption("newest");
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative flex-grow max-w-md">
          <Input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          <button
            type="submit"
            className="absolute right-3 top-2.5 text-neutral-400 hover:text-primary transition-colors"
          >
            <Icons.search className="h-5 w-5" />
          </button>
        </form>

        {/* Sort Dropdown */}
        <div className="flex items-center space-x-2">
          <Label htmlFor="sort" className="whitespace-nowrap">Sort by:</Label>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger id="sort" className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile filters toggle */}
        <Button
          variant="outline"
          className="lg:hidden"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          <Icons.menu className="h-5 w-5 mr-2" />
          Filters
        </Button>
      </div>

      {/* Filters - Desktop view in row, Mobile in accordion */}
      <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="bg-white dark:bg-neutral-800 p-4 rounded-lg shadow-sm">
          <div className="lg:flex items-start gap-8">
            {/* Categories */}
            <div className="mb-4 lg:mb-0 lg:min-w-[200px]">
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="space-y-1">
                <button
                  className={`block text-left w-full px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                    !selectedCategory ? 'bg-primary-100 dark:bg-primary-900 text-primary' : ''
                  }`}
                  onClick={() => setSelectedCategory(undefined)}
                >
                  All Categories
                </button>
                {categoriesLoading ? (
                  <p className="text-sm text-neutral-500">Loading...</p>
                ) : (
                  categories?.map((category) => (
                    <button
                      key={category.id}
                      className={`block text-left w-full px-2 py-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                        selectedCategory === category.id ? 'bg-primary-100 dark:bg-primary-900 text-primary' : ''
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Price Range */}
            <div className="lg:flex-grow mb-4 lg:mb-0">
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="px-2">
                <Slider
                  value={priceRange}
                  min={0}
                  max={500}
                  step={10}
                  onValueChange={handlePriceChange}
                  className="my-6"
                />
                <div className="flex justify-between">
                  <span>${priceRange[0]}</span>
                  <span>${priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Clear filters */}
            <div className="lg:self-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
