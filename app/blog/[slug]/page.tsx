import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { getBlogBySlug } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogDetailClient from './BlogDetailClient';

type Props = {
  params: Promise<{ slug: string }>;
};

// Pulls Q&A pairs out of a post's own "<h2>FAQ</h2>" section (written directly
// in the blog content) to build FAQPage schema — crawler-only, renders nothing;
// human readers already see the same FAQ as part of the article body.
function extractFaqSchema(html: string) {
  const faqSection = html.match(/<h2[^>]*>\s*FAQ\s*<\/h2>([\s\S]*)$/i);
  if (!faqSection) return null;

  const strip = (s: string) => s.replace(/<[^>]+>/g, '').trim();
  const qaPattern = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
  const mainEntity: { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }[] = [];

  let match;
  while ((match = qaPattern.exec(faqSection[1])) !== null) {
    const question = strip(match[1]);
    const answer = strip(match[2]);
    if (question && answer) {
      mainEntity.push({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } });
    }
  }

  return mainEntity.length > 0 ? mainEntity : null;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);

    return {
      title: blog.metaTitle || `${blog.title} | BuzzGram Blog`,
      description: blog.metaDescription || blog.excerpt || blog.title,
      openGraph: {
        title: blog.metaTitle || blog.title,
        description: blog.metaDescription || blog.excerpt || '',
        type: 'article',
        publishedTime: blog.publishedAt || undefined,
        modifiedTime: blog.updatedAt,
        authors: [blog.authorName],
      },
      twitter: {
        card: 'summary',
        title: blog.metaTitle || blog.title,
        description: blog.metaDescription || blog.excerpt || '',
      },
    };
  } catch (error) {
    return {
      title: 'Blog Post Not Found | BuzzGram',
      description: 'The blog post you are looking for could not be found.',
    };
  }
}

// Server Component - SSR for SEO
export default async function BlogDetailPage({ params }: Props) {
  try {
    const { slug } = await params;
    const blog = await getBlogBySlug(slug);

    // Structured data for Google
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog.title,
      description: blog.excerpt || '',
      datePublished: blog.publishedAt,
      dateModified: blog.updatedAt,
      author: {
        '@type': 'Person',
        name: blog.authorName,
      },
      publisher: {
        '@type': 'Organization',
        name: 'BuzzGram',
      },
    };

    const faqEntities = extractFaqSchema(blog.content);
    const faqStructuredData = faqEntities
      ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqEntities }
      : null;

    return (
      <>
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        {/* Structured data for Google/LLM crawlers only — no visible UI */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {faqStructuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
          />
        )}

        <div className="min-h-screen bg-white dark:bg-dark-bg flex flex-col">
          <BlogDetailClient blog={blog} />
          <Footer />
        </div>
      </>
    );
  } catch (error) {
    console.error('[Blog Detail] Error fetching blog:', error);
    return (
      <>
        <Suspense fallback={<div className="h-16" />}>
          <Header />
        </Suspense>
        <div className="min-h-screen bg-white dark:bg-dark-bg flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Blog Post Not Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }
}
