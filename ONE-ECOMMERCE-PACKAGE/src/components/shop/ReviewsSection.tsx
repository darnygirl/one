import { Star } from 'lucide-react';

interface Review {
  author: string;
  rating: number;
  text: string;
  date?: string;
}

interface ReviewsSectionProps {
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  ratingDistribution?: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export function ReviewsSection({
  averageRating,
  totalReviews,
  reviews,
  ratingDistribution
}: ReviewsSectionProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-32 border-t-4 border-black dark:border-white">
      <div className="text-center mb-24">
        <p className="text-xs font-bold tracking-[0.3em] uppercase mb-6">
          Customer Reviews
        </p>

        {/* Animated stars */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-8 h-8 ${
                i < Math.floor(averageRating)
                  ? 'fill-yellow-600 text-yellow-600'
                  : 'text-gray-300 dark:text-gray-700'
              }`}
              style={{
                animation: i < Math.floor(averageRating)
                  ? `starPulse 2s ease-in-out ${i * 0.2}s infinite`
                  : 'none'
              }}
            />
          ))}
        </div>

        <h2 className="text-5xl md:text-6xl font-light tracking-tight">
          {averageRating.toFixed(1)}
        </h2>
        <p className="text-xs tracking-wide mt-4">
          Based on {totalReviews} reviews
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-20">
        {/* Rating Distribution */}
        <div className="space-y-8">
          <p className="text-xs font-bold tracking-[0.3em] uppercase">
            Rating Distribution
          </p>
          {ratingDistribution && (
            <div className="space-y-6">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = ratingDistribution[stars as keyof typeof ratingDistribution];
                const percentage = Math.round((count / totalReviews) * 100);

                return (
                  <div key={stars} className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{stars}</span>
                        <Star className="w-3 h-3 fill-yellow-600 text-yellow-600" />
                      </div>
                      <span className="text-xs tabular-nums">{count}</span>
                    </div>
                    <div className="h-px bg-black dark:bg-white" style={{ width: `${percentage}%` }} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Review List */}
        <div className="md:col-span-2 space-y-12">
          {reviews.map((review, index) => (
            <div key={index} className="space-y-6 pb-12 border-b border-black dark:border-white last:border-0 group">
              <div className="space-y-4">
                {/* Star rating */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 transition-all duration-300 ${
                        i < review.rating
                          ? 'fill-yellow-600 text-yellow-600 group-hover:scale-110'
                          : 'text-gray-300 dark:text-gray-700'
                      }`}
                      style={{
                        transitionDelay: `${i * 50}ms`
                      }}
                    />
                  ))}
                </div>
                <p className="text-base leading-relaxed">
                  {review.text}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold tracking-[0.2em] uppercase">
                  {review.author}
                </span>
                {review.date && (
                  <>
                    <span>•</span>
                    <span className="tracking-wide">{review.date}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes starPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.85;
          }
        }
      `}</style>
    </section>
  );
}
