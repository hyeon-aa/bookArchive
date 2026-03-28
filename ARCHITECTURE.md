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
| **AI** | Groq (`llama-3.3-70b-versatile`), Google Gemini (`embedding-001`) |
| **결제** | Toss Payments |
| **외부 API** | Naver Books API |
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

### 📖 books — 네이버 도서 검색

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/books/search?query=` | 도서 검색 |

**외부 의존**: Naver Books API

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
**외부 의존**: Groq API, Gemini API

<details>
<summary>주요 동작 설명</summary>

- `POST /bookshelf` 호출 시 책이 DB에 없으면 생성하고, `BookEmbedding` 테이블에 벡터를 자동 저장
- `PATCH /bookshelf/:id` 에서 감상(`comment`) 또는 감정(`emotion`)이 있으면 Groq LLM이 AI 코멘트와 태그 3개를 자동 생성
- 독서 완료(`status: DONE`) 시 누적 권수에 따라 레벨업 (10 / 30 / 50 / 100권 기준)
- `getSimilarBooks()` — pgvector `<=>` 연산자로 코사인 유사도 기반 유사 도서 추천

</details>

---

### 🤖 ai — Groq LLM 공통 서비스

> 직접 노출되는 API 엔드포인트 없음. `BookshelfModule`, `AirecommendModule`에서 공유

| 함수 | 설명 |
|------|------|
| `generateCommentAndTags()` | 감상 AI 코멘트 · 태그 3개 생성 |
| `generateBookRecommendations()` | 현재 무드·고민 기반 도서 3권 처방 |
| `generateDailyQuote()` | 오늘 날짜·계절에 맞는 책 속 명문장 |
| `generateTasteBasedRecommendations()` | 책장 데이터 + 벡터 추천 합쳐 취향 분석 |
| `generateAIBookReport()` | 월간 독서 리포트 + 음식 캐릭터 부여 |

**모델**: `llama-3.3-70b-versatile` (Groq) · `response_format: json_object` · `temperature: 0.7`

---

### 🔢 embedding — 텍스트 → 벡터 변환

> 직접 노출되는 API 엔드포인트 없음. `BookshelfModule`, `AirecommendModule`에서 공유

| 함수 | 설명 |
|------|------|
| `createEmbedding(text)` | 텍스트를 `number[]` 벡터로 변환 |

**모델**: `gemini-embedding-001` (Google Gemini)

---

### ✨ airecommend — AI 추천 · 취향 분석 · 독서 리포트 · 명언

| Method | Endpoint | 설명 |
|--------|----------|------|
| `POST` | `/ai-recommend` | 무드·고민 기반 도서 추천 |
| `GET` | `/ai-recommend/daily-quote` | 오늘의 명언 |
| `GET` | `/ai-recommend/taste` | 취향 기반 도서 추천 |
| `GET` | `/ai-recommend/ai-report` | 월간 독서 리포트 |

**의존 모듈**: `BooksModule`, `BookshelfModule`, `AiModule`, `EmbeddingModule`

<details>
<summary>취향 추천 동작 흐름</summary>

1. 내 책장 데이터 조회
2. pgvector로 유사 도서 후보 추출 (`getSimilarBooks`)
3. Groq LLM에 책장 + 유사 후보 전달 → `familiarBooks` 3권 + `challengeBooks` 2권 반환

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

**의존 모듈**: `AiModule`, `EmbeddingModule`

<details>
<summary>동작 흐름</summary>

1. 사용자 질문을 Gemini로 벡터화
2. pgvector `<=>` 연산자로 내 책장에서 유사 도서 5권 추출
3. 도서 정보(상태·감상·감정·AI태그·독서기간)를 컨텍스트로 구성
4. Groq LLM에 시스템 프롬프트 + 현재 세션 대화 히스토리 + 컨텍스트 전달
5. SSE(Server-Sent Events)로 응답을 토큰 단위로 스트리밍

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
| `/books/search` | 도서 검색 (Naver API) |
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
- `useBookSearch(query)` — Naver Books API 검색

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

- 대화 히스토리를 매 요청마다 함께 전송해 문맥 유지
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
| Naver Books API | 도서 메타데이터 검색 | `server/books` · `client/feature/books` |
| Groq (`llama-3.3-70b`) | AI 코멘트·추천·리포트·명언 | `server/ai` |
| Google Gemini (`embedding-001`) | 텍스트 → 벡터 변환 | `server/embedding` |
| Toss Payments | 멤버십 결제 처리 | `server/payment` · `client/feature/payment` |
| PostgreSQL + pgvector | 데이터 저장 · 벡터 유사도 검색 | `server` 전체 |
