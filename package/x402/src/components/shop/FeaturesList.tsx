import { Check } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
}

interface FeaturesListProps {
  features: Feature[];
}

export function FeaturesList({ features }: FeaturesListProps) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-4xl font-black mb-12 tracking-tight">Key Features</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex-shrink-0 mt-1">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
