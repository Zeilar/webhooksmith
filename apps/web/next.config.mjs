/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: ["@workspace/lib"],
  reactCompiler: true,
  typedRoutes: true,
  experimental: { authInterrupts: true },
};

export default nextConfig;
