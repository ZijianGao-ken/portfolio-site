import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export", // 静态导出：生成纯 HTML/CSS/JS 到 out/
  images: { unoptimized: true },
};

export default nextConfig;
