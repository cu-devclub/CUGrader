import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  /* config options here */
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
  }
};
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);

