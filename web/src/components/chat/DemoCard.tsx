/**
 * Demo Card Component
 * Displays a clickable demo suggestion card
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRight, Star, Sparkles, Lock } from 'lucide-react';
import { DEMO_CATEGORIES, type DemoSuggestion } from '@/lib/chat/demos';

interface DemoCardProps {
  suggestion: DemoSuggestion;
  onSelect: (prompt: string) => void;
  isLocked?: boolean;
}

export function DemoCard({ suggestion, onSelect, isLocked = false }: DemoCardProps) {
  const category = DEMO_CATEGORIES[suggestion.category];
  const Icon = suggestion.icon;

  return (
    <Card
      className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group",
        category.bgColor,
        category.borderColor,
        "border-2",
        isLocked && "opacity-60"
      )}
      onClick={() => !isLocked && onSelect(suggestion.prompt)}
    >
      {/* Popular badge */}
      {suggestion.popular && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
            <Star className="w-3 h-3 mr-1" />
            Popular
          </Badge>
        </div>
      )}

      {/* Premium badge */}
      {suggestion.premium && (
        <div className="absolute top-2 left-2 z-10">
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Sparkles className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2.5 rounded-lg bg-gradient-to-br",
            category.color,
            "text-white shadow-lg"
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-base font-semibold">
              {suggestion.title}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {suggestion.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {category.name}
          </Badge>
          <ArrowRight className={cn(
            "w-4 h-4 transition-transform group-hover:translate-x-1",
            isLocked ? "text-muted-foreground" : "text-primary"
          )} />
        </div>
      </CardContent>

      {/* Lock overlay for premium features when no API key */}
      {isLocked && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center p-4">
            <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Add API Key</p>
            <p className="text-xs text-muted-foreground mt-1">to unlock</p>
          </div>
        </div>
      )}
    </Card>
  );
}
