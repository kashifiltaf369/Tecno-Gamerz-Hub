const withNextIntl = require('next-intl/plugin')('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Experimental features
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client"],
  },

  // Image optimization
  images: {
    domains: [
      'localhost',
      'lh3.googleusercontent.com', // Google OAuth avatars
      'static-cdn.jtvnw.net',      // Twitch avatars
      'yt3.ggpht.com',             // YouTube avatars
    ],
  },

  // Environment variables available to the client
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    WEB_URL: process.env.WEB_URL,
    API_URL: process.env.API_URL,
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ];
  },

  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Handle module resolution for workspace packages
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },

  // Bundle analyzer (only in development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: isServer ? 8888 : 8889,
            openAnalyzer: true,
          })
        );
      }
      return config;
    },
  }),
};

module.exports = withNextIntl(nextConfig);