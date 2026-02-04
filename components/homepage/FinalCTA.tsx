import Link from 'next/link';

export default function FinalCTA() {
  return (
    <div className="bg-gradient-to-r from-orange-600 to-orange-700 dark:from-orange-700 dark:to-orange-800 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Message */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-lg sm:text-xl text-orange-100 max-w-2xl mx-auto mb-10">
          Join thousands of customers and businesses connecting through BuzzGram
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-3xl font-bold text-white mb-1">998+</div>
            <div className="text-orange-100 text-sm">Businesses</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-3xl font-bold text-white mb-1">10</div>
            <div className="text-orange-100 text-sm">Major Cities</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-3xl font-bold text-white mb-1">FREE</div>
            <div className="text-orange-100 text-sm">Quote Requests</div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <div className="text-3xl font-bold text-white mb-1">100%</div>
            <div className="text-orange-100 text-sm">FREE Listing</div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/quote"
            className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 min-w-[200px]"
          >
            Request Free Quotes →
          </Link>
          <Link
            href="/business-signup"
            className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 min-w-[200px]"
          >
            List Your Business FREE →
          </Link>
        </div>
      </div>
    </div>
  );
}
