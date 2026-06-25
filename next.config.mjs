/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost"],
  },
  experimental: {
    serverComponentsExternalPackages: ["@supabase/supabase-js"],
  },
  async rewrites() {
    return [
      {
        source: '/dashboard/super-admin',
        destination: '/dashboard/admin',
      },
      {
        source: '/dashboard/super-admin/:path*',
        destination: '/dashboard/admin/:path*',
      },
      {
        source: '/dashboard/negociateur',
        destination: '/dashboard/negotiator',
      },
      {
        source: '/dashboard/negociateur/:path*',
        destination: '/dashboard/negotiator/:path*',
      },
    ];
  },
};

export default nextConfig;
