'use client';

import Image from 'next/image';
import Link from 'next/link';

const DOCS_URL = 'https://docs.arca.markets/';

type FooterGridLink = {
  href: string;
  label: string;
  external?: boolean;
  emphasis?: boolean;
};

const footerGridLinks: FooterGridLink[] = [
  { href: '/', label: 'Platform', emphasis: true },
  { href: '/discover', label: 'Discover Agents' },
  { href: '/dashboard', label: 'Investor Dashboard' },
  { href: '/deploy', label: 'Deployer Dashboard' },
  { href: '/apply', label: 'Apply To Launch' },
  { href: DOCS_URL, label: 'Docs', external: true },
];

const legalLinks = [
  { href: '#privacy', label: 'Privacy' },
  { href: '#terms', label: 'Terms' },
  { href: '#disclaimer', label: 'Disclaimer' },
];

function FooterSocialLink({
  href,
  label,
  iconSrc,
  iconWidth,
  iconHeight,
}: {
  href: string;
  label: string;
  iconSrc: string;
  iconWidth: number;
  iconHeight: number;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="site-footer-social"
      aria-label={label}
    >
      <span className="site-footer-social-corner site-footer-social-corner-tl" aria-hidden />
      <span className="site-footer-social-corner site-footer-social-corner-bl" aria-hidden />
      <span className="site-footer-social-corner site-footer-social-corner-tr" aria-hidden />
      <span className="site-footer-social-corner site-footer-social-corner-br" aria-hidden />
      <span className="site-footer-social-icon">
        <Image src={iconSrc} alt="" width={iconWidth} height={iconHeight} />
      </span>
    </a>
  );
}

function FooterGridLinkItem({ link }: { link: FooterGridLink }) {
  const className = `site-footer-grid-link${link.emphasis ? ' is-emphasis' : ''}`;

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-shell">
        <div className="site-footer-top">
          <div className="site-footer-copyright">
            <Image
              src="/footer/copyright.svg"
              alt=""
              width={18}
              height={18}
              className="site-footer-copyright-icon"
              aria-hidden
            />
            <span>All Copyright reserved</span>
          </div>

          <Link href="/" className="site-footer-logo" aria-label="arca home">
            <Image
              src="/footer/logo-mark.png"
              alt=""
              width={27}
              height={27}
              className="site-footer-logo-mark"
            />
            <span>arca</span>
          </Link>

          <div className="site-footer-socials">
            <FooterSocialLink
              href="https://x.com"
              label="arca on X"
              iconSrc="/footer/twitter.svg"
              iconWidth={20}
              iconHeight={20}
            />
            <FooterSocialLink
              href="https://linkedin.com"
              label="arca on LinkedIn"
              iconSrc="/footer/linkedin.svg"
              iconWidth={24}
              iconHeight={24}
            />
          </div>
        </div>

        <div className="site-footer-grid-wrap">
          <nav className="site-footer-grid" aria-label="Footer">
            {footerGridLinks.map((link) => (
              <FooterGridLinkItem key={link.label} link={link} />
            ))}
          </nav>

          <div className="site-footer-legal">
            <div className="site-footer-legal-links">
              {legalLinks.map((link) => (
                <a key={link.label} href={link.href} className="site-footer-legal-link">
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div className="site-footer-wordmark-stage">
            <div className="site-footer-wordmark-row">
              <span className="site-footer-wordmark-text" aria-hidden>
                arca
              </span>
              <div className="site-footer-wordmark-mark">
                <Image
                  src="/footer/wordmark-glow.png"
                  alt=""
                  width={243}
                  height={257}
                  className="site-footer-wordmark-glow"
                />
                <Image
                  src="/footer/wordmark-shadow.png"
                  alt=""
                  width={297}
                  height={73}
                  className="site-footer-wordmark-shadow"
                />
                <Image
                  src="/footer/wordmark-floor.png"
                  alt=""
                  width={750}
                  height={123}
                  className="site-footer-wordmark-floor"
                />
              </div>
              <span className="site-footer-wordmark-text" aria-hidden>
                arca
              </span>
            </div>
            <Image
              src="/footer/wordmark-base.svg"
              alt=""
              width={1904}
              height={291}
              className="site-footer-wordmark-base"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
