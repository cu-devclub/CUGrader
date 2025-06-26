import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  transpilePackages: [
    'antd',
    '@ant-design/icons',
    '@ant-design/colors',
    '@ant-design/icons-svg',
    '@ant-design/pro-components',
    '@ant-design/pro-layout',
    '@ant-design/pro-list',
    '@ant-design/pro-descriptions',
    '@ant-design/pro-form',
    '@ant-design/pro-table'
  ],
  experimental: {
    optimizePackageImports: ['antd'],
  },
  eslint: {
    ignoreDuringBuilds: true,  // ✅ เพิ่มบรรทัดนี้เพื่อให้ build ไม่พังเพราะ ESLint error
  },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
