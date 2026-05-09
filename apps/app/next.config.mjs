/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  basePath: "/app",
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
