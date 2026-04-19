# NotarisOne Frontend

This is the frontend client for the NotarisOne platform, an advanced document management and scheduling application for Notary and PPAT professionals.

Built with **Next.js 16.2.3**, **React 19**, **Tailwind CSS v4**, and **NextAuth**.

## Prerequisites

- Node.js (v18+ recommended)
- The NotarisOne Backend server running locally or accessible via URL
- A Google Cloud Platform (GCP) project for OAuth and Google Maps integration

## Setup Instructions

### 1. Install Dependencies
Run the following command to install all necessary packages for the frontend:
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root of the `apps/frontend` directory. Make sure it contains the necessary environment variables:

```env
# URL for NextAuth (Typically the local frontend origin)
NEXTAUTH_URL=http://localhost:3000

# Secret key used for signing session tokens (must match Backend definition if shared)
NEXTAUTH_SECRET="<your-super-secret-string>"

# (Optional) Database URL if Direct Database Connections are required occasionally
DATABASE_URL="mysql://username:password@localhost:3306/notarisone"

# Google Maps API Key for the Maps Component (used in Address Autocompletion)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="<your-gcp-maps-api-key>"

# Google OAuth Integration (For Authentication and Calendar Synch)
GOOGLE_CLIENT_ID="<your-google-oauth-client-id>"
GOOGLE_CLIENT_SECRET="<your-google-oauth-client-secret>"
```

### 3. Proxies for the Backend API
Make sure you have configured proxy paths in `next.config.ts` if your backend resolves dynamically through Next.js proxy rewrite routes (e.g., from `/api/:path*` to `http://127.0.0.1:3001/api/:path*`).

### 4. Running the Development Server
To launch the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The application comes with optimizations to manage memory gracefully (`--max-old-space-size=4096`).

### 5. Production Build
To create an optimized production build:
```bash
npm run build
npm run start
```
This prepares static and server-rendered pages efficiently.

## Core Technologies
- **Framework:** Next.js (App Router)
- **UI & Styling:** Tailwind CSS, Shadcn UI Components (`components/ui`), Lucide React
- **Authentication:** NextAuth.js
- **PDF Generation:** jsPDF & jsPDF-Autotable
- **Map Tools:** `@react-google-maps/api`

## Component Structure Highlight
- `src/app/` - The Next.js App Router core containing logic for `dashboard`, `auth`, `PPAT`, and `Deeds`.
- `src/components/ui/` - Reusable interface components mapped via Tailwind and Radix primitives.
