import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

interface ProductHeroProps {
  title: string;
  category: string;
  rating: number;
  reviewCount?: number;
  price: number;
  originalPrice?: number;
  description: string;
  onBuyNow?: () => void;
}

export function ProductHero({
  title,
  category,
  rating,
  reviewCount = 0,
  price,
  originalPrice,
  description,
  onBuyNow
}: ProductHeroProps) {
  const savings = originalPrice ? originalPrice - price : 0;
  const savingsPercent = originalPrice ? Math.round((savings / originalPrice) * 100) : 0;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 md:py-24">
      <div className="space-y-8">
        {/* Category Badge */}
        <div>
          <Badge variant="secondary" className="text-sm uppercase tracking-wider">
            {category}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
          {title}
        </h1>

        {/* Rating */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < Math.floor(rating)
                    ? 'fill-current text-yellow-500'
                    : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-semibold">{rating.toFixed(2)}</span>
          {reviewCount > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({reviewCount} reviews)
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-xl text-gray-600 dark:text-gray-300 font-light leading-relaxed max-w-3xl">
          {description}
        </p>

        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black">${price.toFixed(2)}</span>
            {originalPrice && (
              <span className="text-xl text-gray-500 line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          {savings > 0 && (
            <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
              Save ${savings.toFixed(2)} ({savingsPercent}% off)
            </p>
          )}
        </div>

        {/* CTA Button */}
        <div>
          <Button
            onClick={onBuyNow}
            size="lg"
            className="w-full md:w-auto bg-black dark:bg-white text-white dark:text-black border-2 border-white dark:border-black px-12 py-6 text-lg font-semibold hover:opacity-80 transition-opacity"
          >
            Buy Now
          </Button>
          <p className="text-center md:text-left text-xs text-gray-500 dark:text-gray-400 mt-4">
            Free shipping • 90-day returns • 3-year warranty
          </p>
        </div>
      </div>
    </section>
  );
}
