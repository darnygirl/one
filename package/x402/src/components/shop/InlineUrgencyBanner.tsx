import { useState, useEffect } from 'react';

interface InlineUrgencyBannerProps {
  stock: number;
  offerText: string;
  countdownMinutes?: number;
}

export function InlineUrgencyBanner({
  stock,
  offerText,
  countdownMinutes = 150 // 2.5 hours default
}: InlineUrgencyBannerProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: Math.floor(countdownMinutes / 60),
    minutes: countdownMinutes % 60,
    seconds: 0,
  });

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const stockPercentage = Math.min((stock / 12) * 100, 100);

  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="border-t-4 border-b-4 border-black dark:border-white py-16">
        {/* Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-bold tracking-[0.3em] mb-4 uppercase">
            Limited Availability
          </p>
          <h2 className="text-5xl md:text-7xl font-light tracking-tight mb-6">
            {stock}
          </h2>
          <p className="text-sm tracking-wide uppercase font-medium">
            Units Remaining
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-16 max-w-5xl mx-auto">
          {/* Stock Info */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] mb-4 uppercase">
                Stock Level
              </p>
              <div className="space-y-4">
                <div className="h-1 bg-black dark:bg-white" style={{ width: `${stockPercentage}%` }} />
                <div className="flex justify-between items-baseline">
                  <span className="text-sm uppercase tracking-wide">
                    {Math.round(stockPercentage)}% Sold
                  </span>
                  <span className="text-2xl font-light">
                    {stock}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-black dark:border-white">
              <p className="text-xs font-bold tracking-[0.3em] mb-3 uppercase">
                Offer Details
              </p>
              <p className="text-base leading-relaxed">
                {offerText}
              </p>
            </div>
          </div>

          {/* Timer */}
          <div className="space-y-8">
            <div>
              <p className="text-xs font-bold tracking-[0.3em] mb-8 uppercase">
                Time Remaining
              </p>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="aspect-square border-2 border-black dark:border-white flex items-center justify-center">
                    <span className="text-4xl md:text-5xl font-light tabular-nums">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-xs text-center tracking-widest uppercase">
                    Hours
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="aspect-square border-2 border-black dark:border-white flex items-center justify-center">
                    <span className="text-4xl md:text-5xl font-light tabular-nums">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-xs text-center tracking-widest uppercase">
                    Mins
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="aspect-square border-2 border-black dark:border-white flex items-center justify-center">
                    <span className="text-4xl md:text-5xl font-light tabular-nums">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-xs text-center tracking-widest uppercase">
                    Secs
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-black dark:border-white">
              <button
                onClick={() => window.dispatchEvent(new Event('openBuyDialog'))}
                className="w-full bg-black dark:bg-white text-white dark:text-black border-2 border-white dark:border-black py-4 px-6 hover:opacity-80 transition-opacity duration-200"
              >
                <span className="text-xs font-bold tracking-[0.3em] uppercase">
                  Secure Your Order
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
