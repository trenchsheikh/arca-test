import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@arca/shared', '@material/web', '@lit/react', '@privy-io/react-auth'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/discover',
        destination: '/',
        permanent: true,
      },
      {
        source: '/deploy',
        destination: '/deployer',
        permanent: true,
      },
      {
        source: '/apply',
        destination: '/deployer/launch',
        permanent: true,
      },
    ];
  },
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^@farcaster\/mini-app-solana$/,
      }),
    );
    return config;
  },
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
