// next.config.mjs
import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { typedRoutes: true },
  webpack(config) {
    // ① 路径别名：@ 和 lib
    config.resolve.alias["@"]  = path.resolve(process.cwd());        // '@/...' -> 项目根
    config.resolve.alias["lib"] = path.resolve(process.cwd(), "lib"); // 'lib/...' -> /lib

    // ② 允许从项目根开始解析（绝对导入兜底）
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(process.cwd()),
      "node_modules",
    ];

    return config;
  },
};

export default nextConfig;