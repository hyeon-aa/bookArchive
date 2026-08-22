// client/shared/constants/mood.ts의 MOOD_DATA와 1:1로 대응.
// 클라이언트는 구체적인 무드 형용사(예: "지친")를 currentMood로 보내므로,
// 형용사 → 무드 그룹 → 허용 장르(Book.category, seed-aladin-books.ts의
// SEED_CATEGORIES.name과 동일한 값) 순으로 매핑한다.
// 두 파일이 물리적으로 분리돼 있어 수동 동기화 필요 — mood.ts가 바뀌면 여기도 같이 바꿀 것.

type MoodGroup = 'rest' | 'blue' | 'energy' | 'mood' | 'drive';

const ADJECTIVE_TO_GROUP: Record<string, MoodGroup> = {
  // 휴식/안정
  지친: 'rest',
  무기력한: 'rest',
  잔잔한: 'rest',
  나른한: 'rest',
  편안한: 'rest',
  '쉬어가고 싶은': 'rest',
  '차분해지고 싶은': 'rest',
  // 불안/슬픔
  심란한: 'blue',
  막막한: 'blue',
  예민한: 'blue',
  외로운: 'blue',
  공허한: 'blue',
  // 활기/기쁨
  설레는: 'energy',
  궁금한: 'energy',
  '자신감 있는': 'energy',
  즐거운: 'energy',
  벅찬: 'energy',
  의욕적인: 'energy',
  // 감성/추억
  몽글몽글한: 'mood',
  아련한: 'mood',
  뭉클한: 'mood',
  센치한: 'mood',
  그리운: 'mood',
  // 변화/동기
  '다시 시작하고 싶은': 'drive',
  '자극이 필요한': 'drive',
  '동기부여가 필요한': 'drive',
  '변화가 필요한': 'drive',
};

const GROUP_TO_CATEGORIES: Record<MoodGroup, string[]> = {
  rest: ['에세이', '건강/취미', '요리/살림', '종교에세이', '시화집'],
  blue: ['에세이', '건강/취미', '종교에세이', '시화집'],
  energy: [
    '판타지/환상문학',
    '추리/미스터리소설',
    '과학소설(SF)',
    '한국 로맨스소설',
    '외국 로맨스소설',
  ],
  mood: [
    '한국소설(전체)',
    '한국소설(2000년대 이후)',
    '일본소설',
    '영미소설',
    '세계의 소설',
    '시화집',
    '예술/대중문화',
  ],
  drive: ['자기계발', '경제경영', '인문학', '사회과학', '역사', '과학'],
};

// 매핑에 없는 형용사가 오면 빈 배열 반환 → 호출부에서 장르 필터 없이
// 순수 벡터 검색으로 폴백하도록 설계(하드 에러 대신 우아한 성능 저하).
export function getCategoriesForMood(currentMood: string): string[] {
  const group = ADJECTIVE_TO_GROUP[currentMood.trim()];
  if (!group) return [];
  return GROUP_TO_CATEGORIES[group];
}
