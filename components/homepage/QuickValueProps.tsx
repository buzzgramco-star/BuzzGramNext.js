// AI value-prop banner. Previously promoted OneQuote here with a CTA button —
// OneQuote is still live at /quote and in the header, just no longer
// advertised on the homepage now that Agent Mode is the planned future home
// for quote requests. No button here: the AI chat is already right above.
export default function QuickValueProps() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-600 to-orange-500 dark:from-orange-700 dark:via-orange-700 dark:to-orange-600">
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-6 sm:px-8 py-10 sm:py-12 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-snug mb-2">
          Stop scrolling Instagram.<br className="hidden sm:block" /> Start asking BuzzGram.
        </h2>
        <p className="text-sm sm:text-base text-orange-100 max-w-xl mx-auto">
          The nail tech your friends swear by. The baker who sells out every week. The photographer everyone loves. They&apos;re all on BuzzGram and it&apos;s free.
        </p>
      </div>
    </div>
  );
}
