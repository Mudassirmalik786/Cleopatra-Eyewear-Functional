import { Link } from "wouter";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { toast } = useToast();
  
  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  const quickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // In a real app, this would show a quick view modal
    // For now, we'll just navigate to the product page
    window.location.href = `/products/${product.id}`;
  };
  
  // Helper function to determine badge type
  const getBadgeType = () => {
    if (product.featured) {
      return { text: "Featured", bgClass: "bg-primary-100 text-primary" };
    }
    if (product.stockCount < 10) {
      return { text: "Limited", bgClass: "bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300" };
    }
    if (product.stockCount > 50) {
      return { text: "In Stock", bgClass: "bg-secondary-300 text-secondary-600" };
    }
    return { text: "New", bgClass: "bg-primary-100 text-primary" };
  };
  
  const badge = getBadgeType();

  // Mock rating for display (in a real app, this would come from product reviews)
  const rating = (product.id % 5) + Math.floor(Math.random() * 10) / 10;
  const reviewCount = 10 + (product.id % 50);
  
  return (
    <Link href={`/products/${product.id}`}>
      <a className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all">
        <div className="relative group">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button 
              variant="secondary" 
              size="icon" 
              className="mr-2 bg-white text-primary hover:bg-primary hover:text-white transition-all"
              onClick={quickView}
            >
              <Icons.eye className="h-5 w-5" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              className="bg-white text-primary hover:bg-primary hover:text-white transition-all"
              onClick={addToCart}
            >
              <Icons.cart className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-medium text-lg mb-1">{product.name}</h3>
          <div className="flex items-center mb-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Icons.star 
                  key={i} 
                  className={`h-4 w-4 ${i >= Math.round(rating) ? 'text-neutral-300 dark:text-neutral-600' : ''}`} 
                />
              ))}
            </div>
            <span className="text-neutral-500 dark:text-neutral-400 text-sm ml-1">({reviewCount})</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-lg">{formatPrice(product.price)}</span>
            <span className={`text-xs px-2 py-1 ${badge.bgClass} rounded-full`}>{badge.text}</span>
          </div>
        </div>
      </a>
    </Link>
  );
}
