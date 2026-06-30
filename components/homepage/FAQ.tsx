'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is BuzzGram?',
    answer: 'BuzzGram is the first platform dedicated to connecting customers with home-based and Instagram-only businesses. These are the nail techs, bakers, lash artists, photographers, and event planners who built their entire business on Instagram — visible only to people who happen to hear about them. BuzzGram AI makes them discoverable for the first time.',
  },
  {
    question: 'How does the AI search work?',
    answer: 'Just describe what you want in plain language — "nail set under $60 this weekend", "baker for a custom birthday cake", or "help me plan a bridal shower for 20 people." BuzzGram AI understands your budget, occasion, and vibe, then instantly surfaces the best-matched local businesses. You can ask follow-ups, refine results, and keep the conversation going until you find your match.',
  },
  {
    question: 'How does BuzzGram work?',
    answer: 'Use the AI chat to describe what you need and get matched instantly, or browse directly by city and category. View Instagram portfolios, check services and pricing, and send quote requests to multiple businesses at once. No middlemen, no booking fees — just you and the vendor.',
  },
  {
    question: 'Is BuzzGram free to use?',
    answer: 'Yes — completely free for customers to search, browse, and request quotes. Business owners can also list their services for free with no hidden fees or credit card required.',
  },
  {
    question: 'What cities does BuzzGram serve?',
    answer: 'BuzzGram is live in 10 major cities: Toronto, Vancouver, Calgary, Montreal, and Ottawa in Canada; and New York City, Chicago, Los Angeles, Miami, and Phoenix in the United States. More cities are coming soon.',
  },
  {
    question: 'How is BuzzGram different from Google or Yelp?',
    answer: 'Google and Yelp are built for businesses with storefronts and web presence. BuzzGram is built for the businesses they ignore — home-based nail techs, private chefs, Instagram-only bakers, and event planners who operate without a traditional listing. We pair that exclusive network with AI-powered discovery, so instead of typing keywords, you describe what you want and get matched instantly. No commission, no booking fees, no middlemen.',
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
