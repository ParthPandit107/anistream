/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
      },
      {
        protocol: 'https',
        hostname: 'cdn.myanimelist.net',
      },
      {
        protocol: 'https',
        hostname: 'images.myanimelist.net',
      },
      {
        protocol: 'https',
        hostname: '**.hdslb.com',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
