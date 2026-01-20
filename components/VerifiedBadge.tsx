interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function VerifiedBadge({ size = 'md' }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <svg
      className={`${sizeClasses[size]} inline-block`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Verified"
    >
      <title>Verified Business</title>
      {/* Orange circle background */}
      <circle cx="12" cy="12" r="11" fill="#ff6b35" />
      {/* White checkmark */}
      <path
        d="M7 12.5L10 15.5L17 8.5"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
