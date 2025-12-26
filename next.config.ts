import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Enable static export for Netlify deployment
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Set trailing slash for static hosting
  trailingSlash: true,
};

export default nextConfig;
