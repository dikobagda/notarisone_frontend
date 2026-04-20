import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
    if (!backendUrl) {
      console.warn("NEXT_PUBLIC_BACKEND_API_URL is not defined. Rewrites might fail.");
      return [];
    }
    return [
      {
        source: '/api/backauth/:path*',
        destination: `${backendUrl}/api/backauth/:path*`,
      },
      {
        source: '/api/subscription/:path*',
        destination: `${backendUrl}/api/subscription/:path*`,
      },
      {
        source: '/api/tenant/:path*',
        destination: `${backendUrl}/api/tenant/:path*`,
      },
      {
        source: '/api/google/:path*',
        destination: `${backendUrl}/api/google/:path*`,
      },
      {
        source: '/api/ocr/:path*',
        destination: `${backendUrl}/api/ocr/:path*`,
      },
      {
        source: '/api/gdocs/:path*',
        destination: `${backendUrl}/api/gdocs/:path*`,
      },
      {
        source: '/api/deeds/:path*',
        destination: `${backendUrl}/api/deeds/:path*`,
      },
      {
        source: '/api/clients/:path*',
        destination: `${backendUrl}/api/clients/:path*`,
      },
      {
        source: '/api/appointments/:path*',
        destination: `${backendUrl}/api/appointments/:path*`,
      },
      {
        source: '/api/repertorium/:path*',
        destination: `${backendUrl}/api/repertorium/:path*`,
      },
      {
        source: '/api/admin/:path*',
        destination: `${backendUrl}/api/admin/:path*`,
      },
      {
        source: '/api/billing/:path*',
        destination: `${backendUrl}/api/billing/:path*`,
      },
      {
        source: '/api/templates/:path*',
        destination: `${backendUrl}/api/templates/:path*`,
      },
      {
        source: '/api/audit/:path*',
        destination: `${backendUrl}/api/audit/:path*`,
      },
      {
        source: '/api/team/:path*',
        destination: `${backendUrl}/api/team/:path*`,
      },
      {
        source: '/api/tenant-teams/:path*',
        destination: `${backendUrl}/api/tenant-teams/:path*`,
      },
      {
        source: '/api/profile/:path*',
        destination: `${backendUrl}/api/profile/:path*`,
      },
    ];
  },
};

export default nextConfig;
