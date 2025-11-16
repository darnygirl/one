import { useState, useEffect } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Purchase {
  name: string;
  location: string;
  timeAgo: string;
  product: string;
}

const mockPurchases: Purchase[] = [
  { name: 'Sarah M.', location: 'New York, USA', timeAgo: '2 min ago', product: 'Chanel Coco Noir' },
  { name: 'Michael R.', location: 'London, UK', timeAgo: '5 min ago', product: 'Chanel Coco Noir' },
  { name: 'Emma W.', location: 'Tokyo, Japan', timeAgo: '8 min ago', product: 'Chanel Coco Noir' },
  { name: 'Jessica L.', location: 'Paris, France', timeAgo: '12 min ago', product: 'Chanel Coco Noir' },
  { name: 'David K.', location: 'Dubai, UAE', timeAgo: '15 min ago', product: 'Chanel Coco Noir' },
  { name: 'Sophie T.', location: 'Singapore', timeAgo: '18 min ago', product: 'Chanel Coco Noir' },
  { name: 'James P.', location: 'Los Angeles, USA', timeAgo: '22 min ago', product: 'Chanel Coco Noir' },
  { name: 'Olivia B.', location: 'Miami, USA', timeAgo: '25 min ago', product: 'Chanel Coco Noir' },
  { name: 'Lucas M.', location: 'Sydney, Australia', timeAgo: '30 min ago', product: 'Chanel Coco Noir' },
  { name: 'Isabella R.', location: 'Barcelona, Spain', timeAgo: '35 min ago', product: 'Chanel Coco Noir' },
];

export function RecentPurchaseToast() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Hide toast after 5 seconds, show next one after 8 seconds total
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    const showTimer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mockPurchases.length);
      setIsVisible(true);
    }, 8000);

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(showTimer);
    };
  }, [currentIndex, isDismissed]);

  const currentPurchase = mockPurchases[currentIndex];

  if (isDismissed) return null;

  return (
    <div className="fixed bottom-20 md:bottom-24 right-2 md:right-4 z-40 pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="pointer-events-auto bg-white dark:bg-black border-2 border-black dark:border-white shadow-2xl max-w-[280px] md:max-w-sm"
          >
            <div className="flex items-start gap-3 md:gap-4 p-3 md:p-5">
              <div className="flex items-center justify-center w-10 h-10 border border-black dark:border-white flex-shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-2">
                  Recent Purchase
                </p>
                <p className="text-sm font-medium tracking-wide truncate">
                  {currentPurchase.name} from {currentPurchase.location}
                </p>
                <p className="text-xs tracking-wide mt-1 opacity-60">
                  Purchased {currentPurchase.product}
                </p>
                <p className="text-xs tracking-wide mt-1 opacity-40">
                  {currentPurchase.timeAgo}
                </p>
              </div>
              <button
                onClick={() => setIsDismissed(true)}
                className="flex-shrink-0 hover:opacity-60 transition-opacity"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
