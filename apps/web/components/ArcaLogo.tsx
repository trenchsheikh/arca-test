import Link from 'next/link';

export function ArcaLogo({
  size = 32,
  showWordmark = true,
  className = '',
}: {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle cx="24" cy="24" r="24" fill="#5D74E5" />
        <path
          d="M14 30c4.5-8 7.5-14 10-18 2.5 4 5.5 10 10 18"
          stroke="white"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M17.5 30c3.2-5.5 5.4-9.8 6.5-13.2 1.1 3.4 3.3 7.7 6.5 13.2"
          stroke="white"
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.85"
          fill="none"
        />
      </svg>
      {showWordmark && (
        <span className="font-display text-[1.35rem] font-semibold lowercase tracking-tight text-black">
          arca
        </span>
      )}
    </Link>
  );
}
