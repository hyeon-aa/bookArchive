const NAVER_IMAGE_HOSTS = [
  "bookthumb-phinf.pstatic.net",
  "shopping-phinf.pstatic.net",
];

const nextConfig = {
  images: {
    remotePatterns: NAVER_IMAGE_HOSTS.map((host) => ({
      protocol: "https",
      hostname: host,
    })),
  },
};

module.exports = nextConfig;

export default nextConfig;
