import Image from 'next/image';

export function HomeSectionDivider() {
  return (
    <div className="home-section-divider" aria-hidden>
      <Image
        src="/home/box.png"
        alt=""
        width={1318}
        height={30}
        className="home-section-divider-image"
        sizes="(max-width: 1438px) calc(100vw - 7.5rem), 1318px"
        priority
      />
    </div>
  );
}
