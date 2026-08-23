// 네이버 도서 검색 API가 2026-07-31에 종료되어 알라딘으로 교체됐지만,
// 그 전에 네이버로 검색해서 담은 기존 책 데이터의 imageUrl은 여전히
// 네이버 호스트를 가리키고 있어 계속 허용해야 함.
const BOOK_IMAGE_HOSTS = [
  "bookthumb-phinf.pstatic.net",
  "shopping-phinf.pstatic.net",
  "image.aladin.co.kr",
];

const nextConfig = {
  images: {
    remotePatterns: BOOK_IMAGE_HOSTS.map((host) => ({
      protocol: "https",
      hostname: host,
    })),
  },
};

module.exports = nextConfig;

export default nextConfig;
