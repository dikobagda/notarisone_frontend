/**
 * Central utility for API interaction
 */

export const getApiUrl = (path: string): string => {
  const base = process.env.NEXT_PUBLIC_BACKEND_API_URL;
  
  // If no base URL is defined or it's literally the string "undefined" (common in some build environments),
  // we return the relative path. Most browsers will resolve this relative to the current origin.
  if (!base || base === "undefined") {
    return path;
  }
  
  // Ensure we don't double up on slashes
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBase}${cleanPath}`;
};

export const fetcher = async (url: string, headers: HeadersInit = {}) => {
  const res = await fetch(url, { headers });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const error = new Error(errorData.message || 'An error occurred while fetching data.');
    (error as any).status = res.status;
    throw error;
  }
  
  return res.json();
};
