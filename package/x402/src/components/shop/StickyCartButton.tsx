import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';

interface StickyCartButtonProps {
  price: number;
  productName: string;
  stripeEnabled?: boolean;
}

export function StickyCartButton({ price, productName, stripeEnabled = false }: StickyCartButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when hero CTA is out of viewport (scrolled past ~800px)
      const heroCtaThreshold = 800;
      setIsVisible(window.scrollY > heroCtaThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBuyNow = async () => {
    // Default to quantity of 1 for mobile quick buy
    const quantity = (window as any).orderQuantity || 1;
    (window as any).orderQuantity = quantity;

    // If Stripe is enabled, redirect to checkout
    if (stripeEnabled) {
      setProcessing(true);
      try {
        const formData = new FormData();
        formData.append('quantity', String(quantity));
        formData.append('email', 'customer@example.com'); // This should come from user session or form

        const response = await fetch(window.location.pathname, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Payment processing failed');
        }

        const data = await response.json();

        // Redirect to Stripe Checkout
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error('No checkout URL received');
        }
      } catch (error) {
        console.error('Checkout error:', error);
        alert('Payment processing failed. Please try again.');
        setProcessing(false);
      }
    } else {
      // Show modal dialog for contact options
      window.dispatchEvent(new Event('openBuyDialog'));
    }
  };

  if (!isVisible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 p-4 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Price</p>
          <p className="text-2xl font-black">${price.toFixed(2)}</p>
        </div>
        <Button
          onClick={handleBuyNow}
          disabled={processing}
          size="lg"
          className="bg-black dark:bg-white text-white dark:text-black border-2 border-white dark:border-black flex items-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="w-5 h-5" />
          {processing ? 'Processing...' : 'Add to Cart'}
        </Button>
      </div>
    </div>
  );
}
