// LLM 호출 없이, 코드 레벨(키워드 매칭)로 "추천해달라는 의도"인지 판단.
// 채팅은 기본적으로 "내 책장"으로만 범위를 좁혀서 답하지만(개인 독서 기록
// 질문 목적), 사용자가 명시적으로 추천을 요청하면 그때만 전역 후보 풀
// (BookEmbedding, 알라딘 시딩분 포함)까지 검색 범위를 넓힌다.
const RECOMMEND_KEYWORDS = [
  '추천',
  '비슷한 책',
  '비슷한거',
  '비슷한 거',
  '같은 느낌',
  '더 읽을',
  '읽을만한',
  '읽을 만한',
  '다른 책',
];

export function isRecommendationIntent(message: string): boolean {
  return RECOMMEND_KEYWORDS.some((keyword) => message.includes(keyword));
}
