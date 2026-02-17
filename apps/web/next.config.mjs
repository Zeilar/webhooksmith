/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/lib"],
  reactCompiler: true,
  typedRoutes: true,
  experimental: { authInterrupts: true },
};

export default nextConfig;
