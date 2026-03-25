import type { NextConfig } from "next";

const now = new Date();
const buildDate = now.toLocaleDateString('ja-JP', {
  year: 'numeric', month: '2-digit', day: '2-digit'
}).replace(/\//g, '.');
const buildTime = now.toLocaleTimeString('ja-JP', {
  hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo'
});

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_DATE: `${buildDate} ${buildTime}`,
    NEXT_PUBLIC_GIT_BRANCH: process.env.VERCEL_GIT_COMMIT_REF || 'local',
  }
};

export default nextConfig;
