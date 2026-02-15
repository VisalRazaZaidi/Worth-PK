/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Allow Turbopack to run alongside our custom config
  turbopack: {},
  webpack: (config, { isServer }) => {
    // pdfjs-dist optionally requires 'canvas' (Node.js only) — stub it out
    config.resolve.alias.canvas = false;

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        http: false,
        https: false,
        url: false,
      };
    }

    return config;
  },
};

export default nextConfig;
