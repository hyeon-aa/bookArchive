# 📚 bookArchive

> NestJS + TypeScript + PostgreSQL(pgvector) + Groq LLM + Gemini Embedding

---

## 🗂️ 모듈별 역할 & API

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

**모델**: `llama-3.3-70b-versatile` (Groq)  
**공통 설정**: `response_format: json_object`, `temperature: 0.7`

---

### 🔢 embedding — 텍스트 → 벡터 변환

> 직접 노출되는 API 엔드포인트 없음. `BookshelfModule`, `AirecommendModule`에서 공유

| 함수 | 설명 |
|------|------|
| `createEmbedding(text)` | 텍스트를 `number[]` 벡터로 변환 |

**모델**: `gemini-embedding-001` (Google Gemini)  
**사용처**: 책 추가 시 자동 임베딩 저장, 유사 도서 추천

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

### 🔧 prisma / common — 전역 인프라 · 공통 유틸

**prisma/**
- `prisma.module.ts` — `isGlobal: true` 로 모든 모듈에서 별도 import 없이 주입 가능
- `prisma.service.ts` — `PrismaClient` 래퍼, DB 연결 담당

**common/**
- `@CurrentUser` — JWT payload에서 `userId` 꺼내는 파라미터 데코레이터
- `JwtAuthGuard` — `@UseGuards(JwtAuthGuard)` 로 라우터 인증 보호
- `TransformInterceptor` — 모든 응답을 `{ data: ... }` 형식으로 통일

---

## 🧩 모듈 의존 관계

```
AppModule
├── PrismaModule          (global)
├── AuthModule
├── BooksModule
├── BookshelfModule       imports: [AiModule, EmbeddingModule]
│                         exports: [BookshelfService]
├── AirecommendModule     imports: [BooksModule, BookshelfModule, AiModule, EmbeddingModule]
├── AiModule              exports: [aiService]
├── EmbeddingModule       exports: [EmbeddingService]
├── DashboardModule
├── PaymentModule
└── MypageModule
```

---

## 🌐 외부 서비스 연동

| 서비스 | 용도 | 사용 모듈 |
|--------|------|----------|
| Naver Books API | 도서 메타데이터 검색 | `books` |
| Groq (`llama-3.3-70b`) | AI 코멘트·추천·리포트·명언 | `ai` |
| Google Gemini (`embedding-001`) | 텍스트 → 벡터 변환 | `embedding` |
| Toss Payments | 멤버십 결제 처리 | `payment` |
| PostgreSQL + pgvector | 데이터 저장 · 벡터 유사도 검색 | 전체 |
