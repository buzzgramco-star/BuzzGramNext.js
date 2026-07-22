'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is BuzzGram?',
    answer: 'BuzzGram connects customers with home-based and Instagram-only businesses: nail techs, bakers, photographers, and event planners you won\'t find on Google.',
  },
  {
    question: 'How does the AI search work?',
    answer: 'Describe what you need, like texting a friend. For example, "nail tech under $60 this weekend." The AI matches you to real local businesses with pricing, right away.',
  },
  {
    question: 'Is BuzzGram free?',
    answer: 'Yes, for everyone. Searching and browsing is free for customers. Listing your business is free too, no credit card, no hidden fees.',
  },
  {
    question: 'I run my business from home or only on Instagram. Is that a problem?',
    answer: "That's exactly who BuzzGram is for. No storefront needed.",
  },
  {
    question: 'Do you take a cut of bookings or payments?',
    answer: "No. Customers contact and pay you directly on Instagram. We don't process payments or bookings.",
  },
  {
    question: 'Do I need a website to list my business?',
    answer: 'No. Your BuzzGram profile is your web presence, linked straight to your Instagram.',
  },
  {
    question: "My business isn't beauty, food, or events. Can I still list it?",
    answer: 'Yes. Those are our biggest categories today, but we welcome home-based and Instagram businesses of all kinds.',
  },
  {
    question: 'What cities does BuzzGram serve?',
    answer: 'Toronto, Vancouver, Calgary, Montreal, Ottawa, New York, Los Angeles, Chicago, Miami, and Phoenix, with more coming.',
  },
  {
    question: 'I already get clients from Instagram. Why list on BuzzGram?',
    answer: 'Keep them, and gain the people who don\'t follow you yet. Your existing clients also get one place to check your current prices and services.',
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

      <div className="bg-white dark:bg-dark-bg py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
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
