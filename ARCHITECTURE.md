## 🗂️ 목차

- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [서버 — 모듈별 역할 & API](#-서버--모듈별-역할--api)
- [클라이언트 — 페이지 & Feature 모듈](#-클라이언트--페이지--feature-모듈)
- [외부 서비스 연동](#-외부-서비스-연동)

---

## 🛠️ 기술 스택

| 영역 | 기술 |
|------|------|
| **프론트엔드** | Next.js 14 (App Router), TypeScript, Tailwind CSS, React Query, Zustand |
| **백엔드** | NestJS, TypeScript, Prisma |
| **데이터베이스** | PostgreSQL + pgvector |
| **AI** | Google Gemini — 생성(`gemini-2.5-flash`) + 임베딩(`gemini-embedding-001`), 전부 무료 티어 |
| **결제** | Toss Payments |
| **외부 API** | 알라딘 Open API(사용자 실시간 검색 + 추천 후보 풀 배치 시딩) — Naver Books API는 2026-07-31 서비스 종료로 대체됨 |
| **인프라** | Docker (PostgreSQL 컨테이너) |

---

## 📁 프로젝트 구조

```
bookArchive/
├── client/               # Next.js 프론트엔드
│   ├── app/              # App Router 페이지
│   ├── feature/          # 도메인별 API · 쿼리 · 컴포넌트
│   └── shared/           # 전역 스토어 · 공통 컴포넌트 · 훅
├── server/               # NestJS 백엔드
│   └── src/              # 모듈별 소스코드
└── docker-compose.yml    # PostgreSQL + pgvector 컨테이너
```

---

## 🖥️ 서버 — 모듈별 역할 & API

### 🔐 auth — 회원가입 · 로그인 · JWT 인증

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/auth/signup` | 회원가입 |
| `POST` | `/auth/login` | 로그인 → JWT 발급 |
| `GET` | `/auth/me` | 내 정보 조회 |

**핵심 파일**
- `jwt.strategy.ts` — Bearer 토큰 검증 (Passport)
- `jwt-auth-guard.ts` — 라우터 보호 가드 (`@UseGuards`)
- `@CurrentUser` — JWT payload에서 `userId` 꺼내는 커스텀 데코레이터

---

### 📖 books — 도서 검색 + 전역 벡터 검색

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/books/search?query=` | 사용자 실시간 검색 (알라딘) |

| 함수 | 설명 |
|------|------|
| `search(query)` | 알라딘 `ItemSearch`로 키워드 검색 (엔드포인트로 노출) — 2026-07-31 Naver 도서 검색 API 종료로 알라딘으로 전면 교체 |
| `searchByVector(vectorStr, limit, categories?, excludeOwnedByUserId?)` | `BookEmbedding` 전역 풀에서 벡터 유사도 검색 — 추천 로직 전용, 엔드포인트 없음. `categories`로 장르 필터, `excludeOwnedByUserId`로 이미 가진 책 제외(둘 다 SQL `WHERE` 절에서 코드 레벨로 처리, LLM 판단 아님) |

**외부 의존**: 알라딘 Open API

---

### 🏛️ aladin — 알라딘 Open API 클라이언트 (실시간 검색 + 배치 시딩)

> 직접 노출되는 API 엔드포인트 없음. `BooksModule`(실시간 검색), 시딩 스크립트(배치)에서 사용

Naver 도서 검색 API가 2026-07-31부로 완전 종료되면서(공지 후 유예기간·대체 API
없음), 사용자 실시간 검색까지 포함해 알라딘 Open API로 전면 교체했다.
장르 필터를 위한 `Book.category` 확보를 위해서도 알라딘 쪽이 더 적합했다
(카테고리 정보 포함).

| 함수 | 설명 |
|------|------|
| `searchByKeyword(query, maxResults, start)` | `ItemSearch.aspx` — 사용자 실시간 키워드 검색. `BooksService.search()`가 호출 |
| `fetchBestsellers(categoryId, maxResults, start)` | `ItemList.aspx` — 카테고리별 베스트셀러 조회, 추천 후보 풀 배치 시딩 전용. 호출당 최대 50건이라 `start`로 페이지네이션 |

**실행**: `server` 디렉터리에서 `npm run seed:aladin`. 카테고리 목록은
`src/scripts/seed-aladin-books.ts`에 누적 관리(31개, 실제 API 호출로
검증된 ID만 사용). 이미 임베딩된 책은 건너뛰므로 재실행해도 안전 —
재실행 시 기존 책의 `category`만 최신값으로 백필됨.

---

### 📚 bookshelf — 책장 CRUD · AI 태그 자동생성 · 레벨업 · 유사책 검색

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/bookshelf` | 책 추가 + 벡터 임베딩 자동 저장 |
| `GET` | `/bookshelf` | 내 책장 전체 조회 |
| `GET` | `/bookshelf/:id` | 책장 항목 상세 조회 |
| `PATCH` | `/bookshelf/:id` | 감상 저장 → AI 코멘트·태그 자동 생성 |
| `DELETE` | `/bookshelf/batch` | 복수 항목 삭제 |

**의존 모듈**: `AiModule`, `EmbeddingModule`  
**외부 의존**: Gemini API

<details>
<summary>주요 동작 설명</summary>

- `POST /bookshelf` 호출 시 책이 DB에 없으면 생성하고, `BookEmbedding`(전역 콘텐츠 인덱스, 책마다 1개)에 벡터를 자동 저장. 임베딩 텍스트는 `description`만 사용(제목/저자는 이미 `Book` 테이블에 구조화된 컬럼으로 있어서 임베딩엔 안 섞음, description이 없는 책만 제목+저자로 폴백)
- `PATCH /bookshelf/:id` 에서 감상(`comment`) 또는 감정(`emotion`)이 있으면 Gemini가 AI 코멘트와 태그 3개를 자동 생성하고, 동시에 그 감상·감정 자체를 별도로 임베딩해 `BookshelfEmbedding`(유저 스코프)에 저장 — "위로받은 책이 뭐였지" 같은 감상 기반 질문이 채팅 RAG에서 검색되게 하기 위함
- 독서 완료(`status: DONE`) 시 누적 권수에 따라 레벨업 (10 / 30 / 50 / 100권 기준)
- `getSimilarBooks()` — 최근 추가한 내 책들의 임베딩 평균 벡터로, 내가 아직 안 가진 책(`Bookshelf` 조인으로 제외) 중 가장 가까운 후보를 전역 `BookEmbedding` 풀(알라딘 배치 시딩분 포함)에서 검색. `isbn`·이미지·설명까지 전부 반환해서 별도 외부 API 재검증 없이 바로 씀 — 후보 자체가 이미 우리 DB의 실존 책이라 검증이 필요 없음

</details>

---

### 🤖 ai — Gemini LLM 공통 서비스

> 직접 노출되는 API 엔드포인트 없음. `BookshelfModule`, `AirecommendModule`, `ChatModule`에서 공유

| 함수 | 설명 |
|------|------|
| `generateCommentAndTags()` | 감상 AI 코멘트 · 태그 3개 생성 |
| `generateBookRecommendations(mood, talk, candidates)` | 무드·고민 기반 도서 추천 — **candidates(벡터 검색으로 미리 찾은 실존 후보) 중에서만 고르도록 제약**, LLM이 책을 지어낼 수 없음 |
| `generateDailyQuote()` | 오늘 날짜·계절에 맞는 책 속 명문장 |
| `generateTasteBasedRecommendations()` | 책장 데이터 + 벡터 추천 후보 중에서만 골라 취향 분석 (동일하게 후보 제약) |
| `generateStreamCompletion(messages, systemInstruction, signal)` | 채팅 스트리밍 응답 생성, `AbortSignal`로 중단 가능 |
| `generateAIBookReport()` | 월간 독서 리포트 + 음식 캐릭터 부여 |

**모델**: `gemini-2.5-flash` (Google Gemini, 무료 티어) · `responseMimeType: application/json` · `temperature: 0.7`

> ⚠️ `gemini-2.5-pro`는 2026-04부터 무료 티어 제외, `gemini-2.5-flash-lite`는 2026-10-16 은퇴 예정 — 둘 다 사용 금지.
> SDK는 `@google/generative-ai`(CJS) 사용. 최신 `@google/genai`는 ESM 전용이라 이 프로젝트의 CommonJS 빌드와 충돌해서 못 씀.

---

### 🔢 embedding — 텍스트 → 벡터 변환

> 직접 노출되는 API 엔드포인트 없음. `BookshelfModule`, `AirecommendModule`에서 공유

| 함수 | 설명 |
|------|------|
| `createEmbedding(text)` | 텍스트를 `number[]` 벡터로 변환 |

**모델**: `gemini-embedding-001` (Google Gemini) · 무료 티어 하루 1000건 제한 (배치 시딩 시 주의)

---

### ✨ airecommend — AI 추천 · 취향 분석 · 독서 리포트 · 명언

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/ai-recommend` | 무드·고민 기반 도서 추천 |
| `GET` | `/ai-recommend/daily-quote` | 오늘의 명언 |
| `GET` | `/ai-recommend/taste` | 취향 기반 도서 추천 |
| `GET` | `/ai-recommend/ai-report` | 월간 독서 리포트 |

**의존 모듈**: `BooksModule`, `BookshelfModule`, `AiModule`, `EmbeddingModule`

> 무드·취향 추천은 둘 다 **"검색 후 생성"**(Retrieve-then-Generate) 구조.
> 예전엔 LLM이 책 제목을 자유 생성한 뒤 외부 API로 사후 검증해서 없으면
> 버리는 방식(Generate-then-Verify)이라 할루시네이션 리스크가 있었음.
> 지금은 항상 벡터 검색으로 실존 후보를 먼저 확보하고, LLM은 그 후보
> 중에서 고르고 이유만 설명함 — 사후 검증 단계 자체가 없어짐(후보가
> 이미 우리 DB의 검증된 책이라).

<details>
<summary>무드 기반 추천 동작 흐름 (POST /ai-recommend)</summary>

1. `currentMood` + `userTalk`를 임베딩
2. `currentMood`를 `getCategoriesForMood()`(`airecommend/constants/mood-category-map.ts`)로 장르 카테고리 목록으로 매핑 — 클라이언트의 `MOOD_DATA`(5개 감정 그룹)를 그대로 미러링한 코드 레벨 하드코딩 매핑, LLM 판단 아님
3. `BookEmbedding` 전역 풀(알라딘 배치 시딩 + 사용자들이 추가한 책)에서 벡터 검색 + 장르 카테고리 필터로 후보 8권 확보 (`booksService.searchByVector(vectorStr, 8, moodCategories)`). 매핑된 카테고리가 없거나 그 카테고리로 후보가 안 나오면 필터 없이 재검색(폴백)
4. Gemini에 후보 목록만 전달 → 후보 중에서 최대 3권 골라 이유와 함께 반환
5. LLM이 고른 제목을 후보 목록과 대조해 완전한 책 정보(isbn·이미지·설명)로 복원

후보 풀이 비어 있으면(시딩 전) "아직 추천할 만한 책 데이터가 충분하지 않아요" 반환.

</details>

<details>
<summary>취향 추천 동작 흐름 (GET /ai-recommend/taste)</summary>

1. 내 책장 데이터 조회 (0권이면 "서재에 책을 담아주시면..." 안내로 조기 반환)
2. `getSimilarBooks()`로 전역 풀에서 유사 도서 후보 8권 추출 (내가 이미 가진 책은 `Bookshelf` 조인으로 제외)
3. Gemini에 책장 + 후보 전달 → 후보 중에서만 `familiarBooks` 최대 3권 + `challengeBooks` 최대 2권 반환
4. 후보 목록에 없는 제목을 LLM이 답하면 그 항목만 걸러냄(정상 동작에선 발생하지 않아야 함)

</details>

---

### 📊 dashboard — 독서 통계

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/dashboard` | 독서 통계 조회 (월별 · 감정 분포) |

---

### 💳 payment — 토스페이먼츠 멤버십 결제

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/payments/ready` | 결제 준비 (`orderId` 생성, 금액: ₩3,900) |
| `POST` | `/payments/confirm` | 결제 승인 (Toss Payments 콜백) |
| `POST` | `/payments/cancel` | 결제 취소 |
| `GET` | `/payments/me` | 내 결제 내역 조회 |

**외부 의존**: Toss Payments API

---

### 👤 mypage — 내 독서 기록 조회

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/mypage/phrases` | 내 좋아하는 문구 모음 |
| `GET` | `/mypage/tags` | 내 AI 태그 모음 |
| `GET` | `/mypage/timeline` | 독서 타임라인 |

---

### 💬 chat — RAG 기반 AI 채팅

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/chat` | 책장 기반 AI 채팅 (SSE 스트리밍) |
| `GET` | `/chat/rooms` | AI 채팅 목록 |
| `POST` | `/chat/rooms` | 새 채팅방 생성 |
| `GET` | `/chat/rooms/:roomId` | 각 채팅방 대화 목록 |
| `DELETE` |	`/chat/batch` |	복수 항목 삭제 |

**의존 모듈**: `AiModule`, `EmbeddingModule`, `BooksModule`, `PrismaModule`

<details>
<summary>동작 흐름</summary>

1. `roomId` 소유권 검증 (다른 유저 방에 메시지가 꽂히지 않도록)
2. 사용자 질문을 Gemini로 벡터화 (`queryVector`, 이후 재사용해서 임베딩 API를 중복 호출 안 함)
3. **내 책 검색(항상 실행)**: 책 내용(`BookEmbedding`, 전역 풀이지만 `Bookshelf` 조인으로 내 책장 범위로 제한)과 사용자 감상(`BookshelfEmbedding`, 유저 스코프) 양쪽에서 검색해 더 가까운 쪽 채택 — 상위 5권, `isOwned: true`
4. **추천 후보 검색(조건부)**: `RecommendationIntentService.isRecommendationIntent(queryVector)`가 "비슷한 책 추천해줘" 류의 의도를 임베딩 유사도로 판단(LLM 아님, 코드 레벨 1차 필터 — 아래 참고)하면, `booksService.searchByVector`로 전역 후보 풀에서 5권 검색. 이미 가진 책은 SQL `WHERE`로 코드 레벨 제외, `isOwned: false`
5. 두 결과를 합쳐 `[사용자의 책장 정보]` / `[추천 후보 도서]` 두 섹션으로 컨텍스트 구성
6. **대화 히스토리는 클라이언트가 안 보냄** — 서버가 DB(`ChatMessage`)에서 최근 12개를 직접 조회해 시스템 프롬프트 + 컨텍스트와 함께 Gemini에 전달
7. 시스템 프롬프트는 3가지 상황을 분기 지시: ① 내 책장 관련 질문(정확히 `status` 기반으로 답) ② 추천 후보가 있을 때(반드시 후보 목록 안에서만 추천, 지어내기 금지) ③ 그 외 일반적인 책 이야기·독서 감상 공유(책장 정보에 얽매이지 않고 자유롭게, LLM 나름의 의견도 곁들여 자연스러운 대화)
8. SSE(Server-Sent Events)로 응답을 토큰 단위로 스트리밍
9. 클라이언트가 중단하거나 연결이 끊기면 `AbortController`로 Gemini 호출 자체도 취소. 스트림 중 실패 시 `{error}` SSE 이벤트로 명시적으로 알림

</details>

<details>
<summary>추천 의도 판단 — RecommendationIntentService (임베딩 유사도, 코드 레벨 1차 필터)</summary>

"추천해줘" 같은 의도 판단 자체를 LLM에 맡기면 판단 근거를 검증할 방법이
없어서, 임베딩 유사도 기반의 코드 레벨 분류기로 처리한다.

1. `RECOMMEND_INTENT_EXAMPLES`(8개 대표 문장, 예: "비슷한 책 추천해줘")를 앵커로 미리 임베딩해서 서버 인스턴스 생명주기 동안 캐싱
2. 사용자 질문 임베딩(`queryVector`, 위 흐름 2번에서 이미 계산한 걸 재사용)과 각 앵커 문장의 코사인 유사도를 계산
3. 최대 유사도가 임계값(`SIMILARITY_THRESHOLD = 0.7`, 아직 미세조정 전) 이상이면 추천 의도로 판단
4. 단순 키워드(`.includes()`) 매칭 대비 장점: "이거 말고 또 읽을 거 없어?"처럼 정확한 키워드가 안 겹쳐도 의미가 비슷하면 걸림
5. 앵커 임베딩 계산이 실패(예: 할당량 초과)하면 캐시를 비우고 다음 호출에서 재시도 — 실패한 Promise를 영구 캐싱해서 서버 재시작 전까지 계속 고장나는 걸 방지

</details>

### 🔧 prisma / common — 전역 인프라 · 공통 유틸

**prisma/**
- `prisma.module.ts` — `isGlobal: true` 로 모든 모듈에서 별도 import 없이 주입 가능
- `prisma.service.ts` — `PrismaClient` 래퍼, DB 연결 담당

**common/**
- `@CurrentUser` — JWT payload에서 `userId` 꺼내는 파라미터 데코레이터
- `JwtAuthGuard` — `@UseGuards(JwtAuthGuard)` 로 라우터 인증 보호
- `TransformInterceptor` — 모든 응답을 `{ data: ... }` 형식으로 통일

---

## 🌐 클라이언트 — 페이지 & Feature 모듈

---

### 📄 페이지 라우팅 (app/)

| 경로 | 설명 | 인증 |
|------|------|------|
| `/` | → `/books/search` 자동 리다이렉트 |
| `/login` | 로그인 |
| `/signup` | 회원가입 |
| `/books/search` | 도서 검색 (알라딘 API) |
| `/bookshelf` | 내 서재 · 리스트/그리드 모드 · 편집모드 삭제 | 
| `/bookshelf/[id]` | 상세 조회 + Funnel 독서기록 (3단계) |
| `/explore` | 오늘의 명언 · 취향 추천 · 내 감정에 따른 AI의 도서 추천 진입| 
| `/dashboard` | 월별 통계 · 감정 분포 · AI 리포트 |
| `/airecommend` | 무드 선택 + 고민 입력 → AI 처리 |
| `/airecommend/result` | AI 추천 결과 |
| `/mypage` | 프로필 · 메뉴 |
| `/mypage/phrases` | 인상깊은 문장 모음 |
| `/mypage/tags` | AI 태그 버블 클라우드 |
| `/mypage/timeline` | 월별 독서 타임라인 | 
| `/mypage/payments` | 결제 내역 |
| `/payment/success` | Toss 결제 성공 콜백 |
| `/payment/fail` | Toss 결제 실패 콜백 |
| `/chat` | AI 채팅 목록 |
| `/chat/[roomId]` | 책장 기반 AI 채팅 (스트리밍) |

---

### 🧩 Feature 모듈 (feature/)

각 도메인은 `api.ts` · `queries.ts` · `keys.ts` · `type.ts` · `components/` 로 구성됩니다.

#### auth/
- `useGetMe()` — `AuthProvider`에서 호출, JWT 쿠키 → `useAuthStore` 동기화
- `useLogin()` / `useSignUp()` — mutation

#### books/
- `useBookSearch(query)` — 알라딘 API 검색

#### bookshelf/

| 함수 / 컴포넌트 | 설명 |
|----------------|------|
| `useMyBooks()` | 내 책장 전체 조회 |
| `useBookshelfItem(id)` | 상세 조회 |
| `useAddBook()` | 책 추가 mutation |
| `useUpdateBookshelfItem()` | 감상 저장 → AI 태그 생성 trigger |
| `useDeleteBooks()` | 복수 삭제 mutation |
| `BooksListView` / `BooksGridView` | 뷰 전환 |
| `BookshelfItem` | 책장 항목 카드 |
| `AIMessageSheet` | AI 코멘트 바텀시트 |
| `SharePreviewModal` | 공유 미리보기 |


**Funnel (3단계 독서 기록)**

```
Step1Status  :  독서 상태 및 의도
→ Step2Review  : 감상평 + 감정
→ Step3Phrase  : 인상 깊은 문장
=> AI의 한마디 및 AI 태그 생성
```

#### explore/

| 컴포넌트 | 설명 |
|----------|------|
| `DailyQuoteCard` | 오늘의 명언 카드 |
| `TasteRecommendation` | 취향 기반 추천 (familiarBooks + challengeBooks) |
| `AIRecommendButton` | `/airecommend` 진입 버튼 |

#### dashboard/

| 컴포넌트 | 설명 |
|----------|------|
| `ReadingOverView` | 총 권수 · 완독률 요약 |
| `MonthlyChart` | 월별 독서 차트 |
| `EmotionSummary` | 감정 통계 |
| `AIReportCard` | 월간 AI 독서 리포트 |

#### payment/

| 컴포넌트 | 설명 |
|----------|------|
| `MembershipBanner` | 멤버십 가입 배너 |
| `PaymentModal` | 결제 진행 모달 |
| `PaymentSuccessContent` | 결제 성공 화면 |
| `PaymentFailContent` | 결제 실패 화면 |

#### mypage/

| 컴포넌트 | 설명 |
|----------|------|
| `MyPageProfile` | 프로필 카드 |
| `MyPageMenuItem` | 메뉴 항목 |
| `BubbleTagCloud` | AI 태그 버블 클라우드 |
| `PhraseItem` | 인상깊은 문장 카드 |

#### chat/

| 컴포넌트 / 기능 | 설명 |
|----------------|------|
| `ChatLisgPage` | 채팅 목록 UI |
| `ChatRoomPage` | 실시간 스트리밍 채팅 UI |

- `roomId`와 현재 메시지만 전송 — 대화 히스토리는 서버가 DB에서 직접 조회(클라이언트가 보내지 않음)
- `EventSource` 대신 `fetch` + `ReadableStream`으로 SSE를 직접 파싱(POST + JWT 헤더가 필요해서 `EventSource`로는 불가능). 청크 경계에서 잘린 이벤트는 버퍼에 모아뒀다가 이어붙이고, `TextDecoder`도 스트리밍 모드로 멀티바이트(한글) 깨짐 방지
- `AbortController`로 응답 중단 가능(중단 버튼). 연결 실패는 초기 연결 단계에서만 짧게 재시도, 스트림이 이미 시작된 뒤 끊기면 에러 이벤트로 명시적으로 알림
- SSE 스트림을 청크 단위로 파싱해 타이핑 애니메이션 효과 구현
- Shift+Enter 줄바꿈 / Enter 전송

---

### 🗃️ 전역 상태 (shared/store — Zustand)

| 스토어 | 상태 | 설명 |
|--------|------|------|
| `useAuthStore` | `isLoggedIn` · `user` · `token` | 로그인 상태 전역 관리 |
| `useModalStore` | `content` | 전역 모달 (`ModalProvider`에서 렌더링) |
| `useRecommendStore` | `result` · `payload` | AI 추천 결과 페이지 간 전달 |

**인증 흐름**
```
로그인 성공 → JWT 쿠키 저장
→ AuthProvider 마운트 → useGetMe() 호출
→ useAuthStore.setLogin() → 전역 isLoggedIn = true
→ 🔒 라우터에서 isLoggedIn 체크
```

---

## 🌐 외부 서비스 연동

| 서비스 | 용도 | 사용 위치 |
|--------|------|----------|
| 알라딘 Open API | 사용자 실시간 도서 검색(`ItemSearch`) + 추천 후보 풀 배치 시딩(`ItemList`, 베스트셀러 목록 조회). Naver Books API는 2026-07-31 서비스 종료로 대체됨 | `server/aladin`, `server/books`, `server/scripts`, `client/feature/books` |
| Google Gemini (`gemini-2.5-flash`) | AI 코멘트·추천·리포트·명언·채팅 생성, 무료 티어 | `server/ai` |
| Google Gemini (`gemini-embedding-001`) | 텍스트 → 벡터 변환, 무료 티어 하루 1000건 | `server/embedding` |
| Toss Payments | 멤버십 결제 처리 | `server/payment` · `client/feature/payment` |
| PostgreSQL + pgvector | 데이터 저장 · 벡터 유사도 검색 | `server` 전체 |
