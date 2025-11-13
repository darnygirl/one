interface Feature {
  title: string;
  description: string;
  image: string;
}

interface FeaturesWithImagesProps {
  features: Feature[];
}

export function FeaturesWithImages({ features }: FeaturesWithImagesProps) {
  return (
    <section id="features" className="max-w-7xl mx-auto px-6 py-32">
      <div className="text-center mb-24 border-t-4 border-b-4 border-black dark:border-white py-12">
        <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3">
          Product Features
        </p>
        <h2 className="text-5xl md:text-6xl font-light tracking-tight">
          Premium Design
        </h2>
      </div>

      <div className="space-y-40">
        {features.map((feature, index) => {
          const isReversed = index % 2 === 1;

          return (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-20 items-center ${
                isReversed ? 'md:grid-flow-dense' : ''
              }`}
            >
              {/* Image */}
              <div
                className={`relative ${isReversed ? 'md:col-start-2' : ''}`}
              >
                <div className="aspect-square border-2 border-black dark:border-white overflow-hidden">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Feature number */}
                <div className="absolute -top-6 -left-6 w-16 h-16 border-2 border-black dark:border-white bg-white dark:bg-black flex items-center justify-center">
                  <span className="text-3xl font-light">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Text */}
              <div className={isReversed ? 'md:col-start-1 md:row-start-1' : ''}>
                <div className="space-y-8">
                  <div className="space-y-6">
                    <p className="text-xs font-bold tracking-[0.3em] uppercase">
                      Feature {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="text-4xl md:text-5xl font-light tracking-tight leading-tight">
                      {feature.title}
                    </h3>
                  </div>

                  <div className="h-px bg-black dark:bg-white w-20" />

                  <p className="text-base leading-relaxed max-w-lg">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
