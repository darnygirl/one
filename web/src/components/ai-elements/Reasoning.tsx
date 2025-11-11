/**
 * Reasoning Component
 *
 * Displays AI's detailed reasoning with expandable sections
 * Shows assumptions, considerations, and conclusions
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ReasoningSection {
  title: string;
  content: string;
  type: 'assumption' | 'consideration' | 'analysis' | 'conclusion';
}

interface ReasoningProps {
  sections: ReasoningSection[];
  title?: string;
  summary?: string;
}

export function Reasoning({
  sections,
  title = 'Reasoning',
  summary,
}: ReasoningProps) {
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const sectionIcons = {
    assumption: '💭',
    consideration: '🤔',
    analysis: '🔍',
    conclusion: '💡',
  };

  const sectionColors = {
    assumption: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20',
    consideration: 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20',
    analysis: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20',
    conclusion: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20',
  };

  return (
    <Card className="my-4 glass-card border-2 border-indigo-200 dark:border-indigo-800">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <span className="text-lg">💭</span>
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {summary && (
              <p className="text-sm text-muted-foreground mt-1">{summary}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (expandedSections.size === sections.length) {
                setExpandedSections(new Set());
              } else {
                setExpandedSections(new Set(sections.map((_, i) => i)));
              }
            }}
          >
            {expandedSections.size === sections.length ? 'Collapse All' : 'Expand All'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {sections.map((section, index) => (
            <Collapsible
              key={index}
              open={expandedSections.has(index)}
              onOpenChange={() => toggleSection(index)}
            >
              <Card className={`border-2 ${sectionColors[section.type]}`}>
                <CollapsibleTrigger asChild>
                  <button className="w-full p-3 flex items-center justify-between hover:opacity-80 transition-opacity">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{sectionIcons[section.type]}</span>
                      <span className="font-semibold text-sm">{section.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {expandedSections.has(index) ? '▲' : '▼'}
                    </span>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-3 pb-3 text-sm text-muted-foreground border-t border-gray-200 dark:border-gray-800 pt-3">
                    {section.content}
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
