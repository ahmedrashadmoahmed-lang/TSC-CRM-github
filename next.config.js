/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Enable experimental features
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },

    // Environment variables
    env: {
        NEXT_PUBLIC_APP_NAME: 'ERP System',
        NEXT_PUBLIC_APP_VERSION: '1.0.0',
    },

    // Webpack configuration
    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
        };
        return config;
    },

    // Image optimization
    images: {
        domains: ['localhost'],
        formats: ['image/webp', 'image/avif'],
    },

    // Headers for security
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on'
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY'
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff'
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block'
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' data: https://fonts.gstatic.com",
                            "img-src 'self' data: https:",
                            "media-src 'self' data:",
                            "connect-src 'self' https://generativelanguage.googleapis.com",
                            "frame-ancestors 'none'",
                        ].join('; ')
                    }
                ]
            }
        ];
    },
};

module.exports = nextConfig;
