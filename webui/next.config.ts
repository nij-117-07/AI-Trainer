import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Strictly at the top level, completely outside of experimental
  allowedDevOrigins: [
    '10.35.151.101', 
    '10.42.0.168', 
    'localhost', 
    '0.0.0.0'
  ],

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  }
};

export default nextConfig;