/**
 * Suggestion Carousel Component
 *
 * Horizontal scrolling suggestions with beautiful hover effects
 */

import { useRef } from 'react';
import { trackSuggestionClick } from '@/lib/ai/suggestions';
import { trackEvent, ChatEvents } from '@/lib/ai/analytics';

interface Suggestion {
  id: string;
  text: string;
  icon?: string;
  category: string;
}

interface SuggestionCarouselProps {
  suggestions: Suggestion[];
  onSuggestionClick: (text: string) => void;
}

export function SuggestionCarousel({
  suggestions,
  onSuggestionClick,
}: SuggestionCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (suggestions.length === 0) return null;

  const handleClick = (suggestion: Suggestion) => {
    trackSuggestionClick(suggestion.id, suggestion.text);
    trackEvent(ChatEvents.SUGGESTION_CLICKED, {
      id: suggestion.id,
      text: suggestion.text,
      category: suggestion.category,
    });
    onSuggestionClick(suggestion.text);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    const newScrollLeft =
      scrollRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
    scrollRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  return (
    <div className="relative group">
      {/* Scroll Buttons (Desktop only) */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white/90 dark:bg-gray-900/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
        aria-label="Scroll left"
      >
        ←
      </button>
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center rounded-full bg-white/90 dark:bg-gray-900/90 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
        aria-label="Scroll right"
      >
        →
      </button>

      {/* Suggestions */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 scroll-smooth"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={() => handleClick(suggestion)}
            className="suggestion-chip flex-shrink-0 inline-flex items-center gap-2"
          >
            {suggestion.icon && <span>{suggestion.icon}</span>}
            <span>{suggestion.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
