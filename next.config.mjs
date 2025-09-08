// next.config.mjs
import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    serverActions: {
      // 仅接受“字符串”，不能是正则
      // 开发环境直接放开（'*'）+ localhost；生产只写你的正式域名
      allowedOrigins:
        process.env.NODE_ENV === "production"
          ? [
              "https://portal.your-prod-domain.com", // TODO: 改成你的正式域名
            ]
          : [
              "*",                    // 开发：允许任意来源（解决 Codespaces 动态域名）
              "http://localhost:3000",
              "https://localhost:3000",
            ],
    },
  },
  webpack(config) {
    config.resolve.alias["@"] = path.resolve(process.cwd());
    config.resolve.alias["lib"] = path.resolve(process.cwd(), "lib");
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(process.cwd()),
      "node_modules",
    ];
    return config;
  },
};

export default nextConfig;
