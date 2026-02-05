'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What cities does BuzzGram serve?',
    answer: 'BuzzGram operates in 10 major cities across the USA and Canada: Toronto, Vancouver, Montreal, Ottawa, and Calgary in Canada; and New York City, Chicago, Los Angeles, Miami, and Phoenix in the United States.',
  },
  {
    question: 'What is BuzzGram?',
    answer: 'BuzzGram is the first platform designed to connect customers with home-based and Instagram businesses. We help you discover talented entrepreneurs offering beauty services (nails, lashes, makeup, hair), food services (bakery, catering, private chefs), and event services (decor, planning, photography) in your local area.',
  },
  {
    question: 'How does BuzzGram work?',
    answer: 'Customers can browse businesses by city and category, view their Instagram profiles to see their work, and request quotes from multiple businesses at once. Business owners can list their services for free, get discovered by local customers, and receive quote requests from people ready to book.',
  },
  {
    question: 'Is BuzzGram free to use?',
    answer: 'Yes! BuzzGram is 100% free for customers to browse and request quotes. Business owners can also list their services completely free with no hidden fees or credit card required.',
  },
  {
    question: 'How is BuzzGram different from other platforms?',
    answer: 'BuzzGram focuses exclusively on home-based and Instagram businesses that traditional platforms often overlook. We provide direct connection with business owners without middlemen, showcase their Instagram portfolios, and allow customers to request quotes from multiple businesses with one simple form.',
  },
  {
    question: 'Can I request quotes from businesses in multiple cities?',
    answer: 'Currently, quotes are city-specific to connect you with local businesses in your area. However, you can browse businesses across all 10 cities and reach out to them directly through their profiles.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Schema.org FAQPage structured data
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* Structured Data for AEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-white dark:bg-dark-bg py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Everything you need to know about BuzzGram
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex justify-between items-center p-6 text-left bg-white dark:bg-dark-card hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="font-semibold text-gray-900 dark:text-white pr-8">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {openIndex === index && (
                  <div className="p-6 pt-0 bg-white dark:bg-dark-card">
                    <p className="text-gray-600 dark:text-gray-300">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
