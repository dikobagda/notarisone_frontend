import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/backauth/:path*',
        destination: 'http://localhost:3001/api/backauth/:path*',
      },
      {
        source: '/api/subscription/:path*',
        destination: 'http://localhost:3001/api/subscription/:path*',
      },
      {
        source: '/api/tenant/:path*',
        destination: 'http://localhost:3001/api/tenant/:path*',
      },
      {
        source: '/api/google/:path*',
        destination: 'http://localhost:3001/api/google/:path*',
      },
      {
        source: '/api/ocr/:path*',
        destination: 'http://localhost:3001/api/ocr/:path*',
      },
      {
        source: '/api/gdocs/:path*',
        destination: 'http://localhost:3001/api/gdocs/:path*',
      },
      {
        source: '/api/deeds/:path*',
        destination: 'http://localhost:3001/api/deeds/:path*',
      },
      {
        source: '/api/clients/:path*',
        destination: 'http://localhost:3001/api/clients/:path*',
      },
      {
        source: '/api/appointments/:path*',
        destination: 'http://localhost:3001/api/appointments/:path*',
      },
      {
        source: '/api/repertorium/:path*',
        destination: 'http://localhost:3001/api/repertorium/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:3001/api/admin/:path*',
      },
      {
        source: '/api/billing/:path*',
        destination: 'http://localhost:3001/api/billing/:path*',
      },
      {
        source: '/api/templates/:path*',
        destination: 'http://localhost:3001/api/templates/:path*',
      },
      {
        source: '/api/audit/:path*',
        destination: 'http://localhost:3001/api/audit/:path*',
      },
      {
        source: '/api/team/:path*',
        destination: 'http://localhost:3001/api/team/:path*',
      },
      {
        source: '/api/tenant-teams/:path*',
        destination: 'http://localhost:3001/api/tenant-teams/:path*',
      },
      {
        source: '/api/profile/:path*',
        destination: 'http://localhost:3001/api/profile/:path*',
      },
    ];
  },
};

export default nextConfig;
