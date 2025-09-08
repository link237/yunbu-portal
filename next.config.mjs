// next.config.mjs
import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    serverActions: {
      // 只写“主机与端口”，不要带 http/https
      // 支持通配符：见官方文档 serverActions.allowedOrigins
      // 开发环境放行 Codespaces 与本地；生产只放你的正式域名
      allowedOrigins:
        process.env.NODE_ENV === "production"
          ? [
              "portal.your-prod-domain.com", // TODO: 换成你的生产域名
              "your-prod-domain.com",
            ]
          : [
              "localhost:3000",
              "127.0.0.1:3000",
              "*.github.dev",
              "*.app.github.dev",
            ],
    },
  },

  webpack(config) {
    // 路径别名
    config.resolve.alias["@"] = path.resolve(process.cwd());
    config.resolve.alias["lib"] = path.resolve(process.cwd(), "lib");

    // 允许从项目根解析
    config.resolve.modules = [
      ...(config.resolve.modules || []),
      path.resolve(process.cwd()),
      "node_modules",
    ];

    return config;
  },
};

export default nextConfig;
