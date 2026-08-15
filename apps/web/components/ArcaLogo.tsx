import Image from 'next/image';
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
      <Image
        src="/logos/arca-logo.png"
        alt="arca"
        width={size}
        height={size}
        className="object-contain shrink-0 drop-shadow-[0_0_12px_rgba(160,170,255,0.35)]"
        priority
      />
      {showWordmark && (
        <span className="font-display text-[1.35rem] font-semibold lowercase tracking-tight text-chalk">
          arca
        </span>
      )}
    </Link>
  );
}
