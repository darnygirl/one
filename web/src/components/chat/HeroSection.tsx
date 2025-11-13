/**
 * Chat Hero Section
 * Displays the main hero content with title and description
 */

import React from 'react';

interface HeroSectionProps {
  hasApiKey: boolean;
  showDemo?: boolean;
}

export function HeroSection({ hasApiKey, showDemo = false }: HeroSectionProps) {
  if (showDemo) {
    return (
      <div className="text-center space-y-6 mb-8">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Generative UI Demo
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Add any react component into AI chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Chat with AI
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Free AI chat powered by Gemini Flash Lite. Add your API key for access to GPT-4, Claude, and 50+ models.
        </p>
      </div>
    </div>
  );
}
