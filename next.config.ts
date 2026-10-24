import type { NextConfig } from 'next';
const config: NextConfig = { experimental: { cpus: 1 }, devIndicators: false, trailingSlash: true, images: { unoptimized: true } };
export default config;
