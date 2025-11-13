interface Spec {
  label: string;
  value: string;
}

interface ProductSpecsProps {
  specs: Spec[];
}

export function ProductSpecs({ specs }: ProductSpecsProps) {
  // Split specs into two columns
  const midpoint = Math.ceil(specs.length / 2);
  const leftColumn = specs.slice(0, midpoint);
  const rightColumn = specs.slice(midpoint);

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 border-t border-gray-200 dark:border-gray-800">
      <h2 className="text-4xl font-black mb-12 tracking-tight">Specifications</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {leftColumn.map((spec, index) => (
            <div
              key={index}
              className="pb-6 border-b border-gray-200 dark:border-gray-800 last:border-0"
            >
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {spec.label}
              </p>
              <p className="text-lg">{spec.value}</p>
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {rightColumn.map((spec, index) => (
            <div
              key={index}
              className="pb-6 border-b border-gray-200 dark:border-gray-800 last:border-0"
            >
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                {spec.label}
              </p>
              <p className="text-lg">{spec.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
