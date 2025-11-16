import { useState, useEffect } from 'react';

const messages: string[] = [
  'FREE WORLDWIDE SHIPPING',
  '90-DAY GUARANTEE',
  '3-YEAR WARRANTY',
];

export function TopBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="border-b border-black dark:border-white bg-black dark:bg-white">
      <div className="max-w-7xl mx-auto px-6 py-3">
        {/* Mobile: Single rotating message */}
        <div className="md:hidden text-center">
          <span className="text-xs font-bold tracking-[0.3em] uppercase text-white dark:text-black">
            {messages[currentIndex]}
          </span>
        </div>

        {/* Desktop: 3-column layout */}
        <div className="hidden md:grid md:grid-cols-3 gap-6 text-xs font-bold tracking-[0.3em] uppercase text-white dark:text-black">
          <div className="text-left">{messages[0]}</div>
          <div className="text-center">{messages[1]}</div>
          <div className="text-right">{messages[2]}</div>
        </div>
      </div>
    </div>
  );
}
