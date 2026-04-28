/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_POLYGON_CHAIN_ID: process.env.NEXT_PUBLIC_POLYGON_CHAIN_ID,
  },
};
export default nextConfig;
