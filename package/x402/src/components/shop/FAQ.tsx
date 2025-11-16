import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Is this product authentic?',
    answer: 'Yes, 100% authentic. We source directly from authorized distributors and guarantee the authenticity of every product. All items come with original packaging and certificates of authenticity.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 90-day money-back guarantee. If you\'re not completely satisfied with your purchase, return it within 90 days for a full refund, no questions asked.',
  },
  {
    question: 'How long does shipping take?',
    answer: 'Orders placed before 2 PM are shipped the same day. We offer free overnight shipping for all orders, so you should receive your package within 1-2 business days.',
  },
  {
    question: 'Do you ship internationally?',
    answer: 'Yes! We ship worldwide with free international shipping on all orders. Delivery times vary by location but typically take 3-7 business days.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers.',
  },
  {
    question: 'Is the fragrance long-lasting?',
    answer: 'Absolutely. Chanel Coco Noir is an Eau de Parfum, which means it has a higher concentration of fragrance oils (15-20%) compared to Eau de Toilette. You can expect 6-8 hours of wear with moderate to strong projection.',
  },
  {
    question: 'What if I receive a damaged product?',
    answer: 'We package all products with extreme care, but if you receive a damaged item, contact us immediately. We\'ll send a replacement at no charge or issue a full refund.',
  },
  {
    question: 'Do you have customer support?',
    answer: 'Yes! Our customer support team is available 24/7 via email, phone, and live chat. We typically respond within 1-2 hours during business days.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-24">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Everything you need to know before you buy
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border-2 border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:border-purple-500 dark:hover:border-purple-500"
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-900"
            >
              <span className="text-lg font-bold pr-4">{faq.question}</span>
              <ChevronDown
                className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${
                  openIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96' : 'max-h-0'
              }`}
            >
              <div className="px-6 pb-6 text-gray-600 dark:text-gray-300">
                {faq.answer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center p-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg border-2 border-purple-200 dark:border-purple-800">
        <p className="text-lg font-semibold mb-4">Still have questions?</p>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Our customer support team is available 24/7 to help you.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:support@example.com"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Email Us
          </a>
          <a
            href="tel:+1234567890"
            className="inline-flex items-center gap-2 bg-white dark:bg-black text-purple-600 dark:text-purple-400 px-6 py-3 rounded-lg font-semibold border-2 border-purple-600 dark:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors"
          >
            Call Now
          </a>
        </div>
      </div>
    </section>
  );
}
