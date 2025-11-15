/**
 * ProductCard - Card for products and services
 *
 * Displays product information with price, stock status, and add to cart functionality.
 * Supports both physical products and services.
 */

import type { Thing, CardProps } from "../types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "../utils";

interface ProductCardProps extends CardProps {
  product: Thing;
  price?: number;
  inStock?: boolean;
  onAddToCart?: (product: Thing) => void;
}

export function ProductCard({
  product,
  price,
  inStock = true,
  onAddToCart,
  variant = "default",
  size = "md",
  interactive = true,
  onClick,
  className = "",
}: ProductCardProps) {
  // Extract product data from metadata
  const productPrice = price ?? (product.metadata?.price as number);
  const productImage = product.metadata?.image as string | undefined;
  const productCategory = product.metadata?.category as string | undefined;
  const stockCount = product.metadata?.stock as number | undefined;

  // Determine stock status
  const isInStock = inStock && (stockCount === undefined || stockCount > 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  return (
    <Card
      className={`${interactive ? "cursor-pointer hover:shadow-lg transition-shadow" : ""} ${className}`}
      onClick={onClick}
    >
      {productImage && (
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">🛍️</span>
            <CardTitle className={size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg"}>
              {product.name}
            </CardTitle>
          </div>
          {productCategory && (
            <Badge variant="secondary" className="shrink-0">
              {productCategory}
            </Badge>
          )}
        </div>
        {product.description && (
          <CardDescription className="line-clamp-2">
            {product.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {productPrice !== undefined ? (
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(productPrice)}
            </div>
          ) : (
            <div className="text-lg text-muted-foreground">Price not set</div>
          )}
          <div className="flex items-center gap-2">
            {isInStock ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                ✓ In Stock
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Out of Stock
              </Badge>
            )}
          </div>
        </div>
        {stockCount !== undefined && isInStock && (
          <p className="text-sm text-muted-foreground mt-2">
            {stockCount} {stockCount === 1 ? "item" : "items"} available
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={!isInStock || !onAddToCart}
        >
          {isInStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardFooter>
    </Card>
  );
}
