import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Product, Category } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/constants";
import { ProductGrid } from "@/components/products/ProductGrid";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  
  // Fetch product details
  const { data: product, isLoading: productLoading, error: productError } = useQuery<Product>({
    queryKey: [`/api/products/${id}`],
  });
  
  // Fetch category (if product has categoryId)
  const { data: category } = useQuery<Category>({
    queryKey: [product?.categoryId ? `/api/categories/${product.categoryId}` : null],
    enabled: !!product?.categoryId,
  });
  
  // Handle quantity change
  const incrementQuantity = () => setQuantity(prev => Math.min(prev + 1, product?.stockCount || 10));
  const decrementQuantity = () => setQuantity(prev => Math.max(prev - 1, 1));
  
  // Add to cart handler
  const handleAddToCart = () => {
    if (product) {
      toast({
        title: "Added to cart",
        description: `${quantity} x ${product.name} has been added to your cart.`,
      });
    }
  };
  
  // Navigate back to shop
  const handleBackToShop = () => {
    setLocation(category ? `/shop?category=${category.id}` : '/shop');
  };
  
  if (productError) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          The product you're looking for does not exist or has been removed.
        </p>
        <Button onClick={() => setLocation('/shop')}>
          Back to Shop
        </Button>
      </div>
    );
  }

  return (
    <>
      {product && (
        <Helmet>
          <title>{product.name} | Cleopatra Eyewear Collection</title>
          <meta name="description" content={product.description || `${product.name} - Premium eyewear from Cleopatra Eyewear Collection.`} />
          <meta property="og:title" content={`${product.name} | Cleopatra Eyewear Collection`} />
          <meta property="og:description" content={product.description || `${product.name} - Premium eyewear from Cleopatra Eyewear Collection.`} />
          <meta property="og:image" content={product.imageUrl} />
        </Helmet>
      )}
      
      <div className="container mx-auto py-12 px-4">
        {/* Breadcrumb */}
        <div className="flex items-center mb-8 text-sm">
          <button onClick={() => setLocation('/')} className="text-neutral-500 hover:text-primary">
            Home
          </button>
          <span className="mx-2 text-neutral-400">/</span>
          <button onClick={() => setLocation('/shop')} className="text-neutral-500 hover:text-primary">
            Shop
          </button>
          {category && (
            <>
              <span className="mx-2 text-neutral-400">/</span>
              <button onClick={() => setLocation(`/shop?category=${category.id}`)} className="text-neutral-500 hover:text-primary">
                {category.name}
              </button>
            </>
          )}
          <span className="mx-2 text-neutral-400">/</span>
          <span className="text-neutral-900 dark:text-neutral-200 font-medium">
            {productLoading ? 'Loading...' : product?.name}
          </span>
        </div>
        
        {/* Product Details */}
        <div className="flex flex-col lg:flex-row gap-12 mb-16">
          {/* Product Image */}
          <div className="w-full lg:w-1/2">
            {productLoading ? (
              <Skeleton className="aspect-square w-full rounded-lg" />
            ) : (
              <img 
                src={product?.imageUrl}
                alt={product?.name}
                className="w-full h-auto rounded-lg shadow-md"
              />
            )}
          </div>
          
          {/* Product Info */}
          <div className="w-full lg:w-1/2">
            {productLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-2/3" />
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-8 w-1/3" />
                <div className="pt-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-2 font-poppins">{product?.name}</h1>
                
                <div className="flex items-center mb-4">
                  <div className="flex text-amber-400">
                    {/* Mock rating - in a real app, this would come from product reviews */}
                    {[...Array(5)].map((_, i) => (
                      <Icons.star key={i} className={`h-5 w-5 ${i >= 4 ? 'text-neutral-300 dark:text-neutral-600' : ''}`} />
                    ))}
                  </div>
                  <span className="text-neutral-500 dark:text-neutral-400 text-sm ml-2">(42 reviews)</span>
                </div>
                
                <p className="text-2xl font-bold text-primary mb-6">
                  {product && formatPrice(product.price)}
                </p>
                
                <div className="mb-6">
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                    {product?.description || "Experience premium quality and style with this exceptional eyewear piece from our Cleopatra collection."}
                  </p>
                  
                  <div className="flex items-center mb-2">
                    <span className="font-medium w-24">Brand:</span>
                    <span>{product?.brand || "Cleopatra"}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <span className="font-medium w-24">Category:</span>
                    <span>{category?.name || "Eyewear"}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <span className="font-medium w-24">Availability:</span>
                    <span className={product?.inStock ? "text-green-600" : "text-red-600"}>
                      {product?.inStock ? `In Stock (${product.stockCount} available)` : "Out of Stock"}
                    </span>
                  </div>
                </div>
                
                {/* Quantity Selector */}
                <div className="flex items-center mb-6">
                  <span className="font-medium mr-4">Quantity:</span>
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={decrementQuantity}
                      className="px-3 py-2 border-r hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      disabled={quantity <= 1}
                    >
                      <Icons.arrowLeft className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="px-3 py-2 border-l hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      disabled={quantity >= (product?.stockCount || 10)}
                    >
                      <Icons.arrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={handleAddToCart}
                    className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8"
                    disabled={!product?.inStock}
                  >
                    <Icons.cart className="mr-2 h-5 w-5" /> Add to Cart
                  </Button>
                  <Button 
                    onClick={handleBackToShop}
                    variant="outline" 
                    className="w-full sm:w-auto"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        {product?.categoryId && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8 font-poppins">Related Products</h2>
            <ProductGrid categoryId={product.categoryId} />
          </div>
        )}
      </div>
    </>
  );
}
