/**
 * Demo Suggestions and Categories
 */

import type { LucideIcon } from 'lucide-react';
import {
  Brain,
  ChartBar,
  Palette,
  Zap,
  LineChart,
  Table,
  FormInput,
  Calendar,
} from 'lucide-react';

export interface DemoCategory {
  name: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export interface DemoSuggestion {
  id: string;
  prompt: string;
  title: string;
  description: string;
  category: keyof typeof DEMO_CATEGORIES;
  icon: LucideIcon;
  premium: boolean;
  popular?: boolean;
}

export const DEMO_CATEGORIES = {
  'ai-features': {
    name: 'AI Features',
    icon: Brain,
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
    borderColor: 'border-purple-500/20',
    description: 'Advanced AI capabilities'
  },
  'data-viz': {
    name: 'Data & Analytics',
    icon: ChartBar,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Visualize and analyze data'
  },
  'ui-generation': {
    name: 'UI Generation',
    icon: Palette,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/20',
    description: 'Generate UI components'
  },
  'productivity': {
    name: 'Productivity',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
    borderColor: 'border-orange-500/20',
    description: 'Boost your productivity'
  }
} as const;

export const DEMO_SUGGESTIONS: DemoSuggestion[] = [
  {
    id: 'chart',
    prompt: "📊 Generate a sales chart (demo)",
    title: "Dynamic Charts",
    description: "Create interactive visualizations",
    category: 'data-viz',
    icon: LineChart,
    premium: false,
    popular: true
  },
  {
    id: 'table',
    prompt: "📋 Create a data table (demo)",
    title: "Data Tables",
    description: "Structure data beautifully",
    category: 'data-viz',
    icon: Table,
    premium: false
  },
  {
    id: 'form',
    prompt: "📝 Build a contact form (demo)",
    title: "Smart Forms",
    description: "Generate forms instantly",
    category: 'ui-generation',
    icon: FormInput,
    premium: false
  },
  {
    id: 'timeline',
    prompt: "⏱️ Show project timeline (demo)",
    title: "Timeline View",
    description: "Visualize project milestones",
    category: 'ui-generation',
    icon: Calendar,
    premium: false
  },
];
