import type { NextConfig } from 'next';
const config: NextConfig = { output: 'export', experimental: { cpus: 1 }, devIndicators: false, trailingSlash: true, images: { unoptimized: true } };
export default config;
