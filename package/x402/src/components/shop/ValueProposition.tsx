export function ValueProposition() {
  const values = [
    {
      title: 'Free Shipping',
      description: 'Overnight delivery worldwide on all orders'
    },
    {
      title: '90-Day Returns',
      description: 'Full refund, no questions asked'
    },
    {
      title: 'Secure Payment',
      description: '256-bit SSL encryption for all transactions'
    },
    {
      title: '24/7 Support',
      description: 'Expert assistance whenever you need it'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-32 border-t-4 border-black dark:border-white">
      <div className="text-center mb-24">
        <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3">
          Why Choose Us
        </p>
        <h2 className="text-5xl md:text-6xl font-light tracking-tight">
          Premium Service
        </h2>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
        {values.map((value, index) => (
          <div key={index} className="space-y-6">
            <div className="space-y-4">
              <div className="w-12 h-12 border-2 border-black dark:border-white flex items-center justify-center">
                <span className="text-2xl font-light">
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>
              <p className="text-xs font-bold tracking-[0.3em] uppercase">
                {value.title}
              </p>
            </div>
            <div className="h-px bg-black dark:bg-white w-16" />
            <p className="text-sm leading-relaxed">
              {value.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
