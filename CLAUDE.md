# CLAUDE.md

bookArchive — Next.js + NestJS + pgvector 기반 RAG AI 북 큐레이터.
전체 기능/API 설명은 `README.md`, `ARCHITECTURE.md` 참고. 이 파일은 그걸
반복하지 않고, 세션마다 매번 다시 설명하기 아까운 것들만 적어둠.

**주의**: `ARCHITECTURE.md`는 아직 Groq 기준으로 작성돼 있어서 일부 낡음
(LLM 프로바이더는 Gemini로 교체됨, `BookEmbedding`은 더 이상 유저 스코프
아님). 코드가 실제 기준이고, 문서와 다르면 코드를 믿을 것.

## 로컬 개발 DB — Render 원격 DB는 기본적으로 접속 안 됨

`server/.env`의 `DATABASE_URL`은 기본이 Render 원격 Postgres인데, 로컬에서
SSL 핸드셰이크 단계에서 막혀서 연결이 안 되는 경우가 흔함. 실제 서버를
띄우거나 마이그레이션/시딩 스크립트를 돌려야 하면 로컬 Docker DB를 써야 함:

```bash
POSTGRES_USER=postgres POSTGRES_PASSWORD=password123 POSTGRES_DB=cloud_db \
  docker compose up -d db
```

그 다음 `server/.env`에서 `DATABASE_URL` 두 줄 중 로컬 줄(`localhost:5433`)의
주석을 풀고 Render 줄을 주석 처리. 작업 끝나면 **반드시 원상복구**
(Render 줄 다시 활성화, 로컬 줄 주석 처리) 후 `docker compose stop db`.
로컬 DB엔 기존 개발용 계정(`test3@test.com` / `test3333`)이 남아있음.

절대 하지 말 것: 검증/테스트를 이유로 프로덕션(Render) DB에 테스트
계정이나 더미 데이터를 직접 꽂는 것. 항상 로컬 DB에서 검증.

## 모델명 · 외부 API 파라미터는 절대 추측하지 말 것

이 프로젝트에서 실제로 겪은 사고들: Groq 모델명이 배포 중간에 카탈로그에서
사라져서(`llama-3.3-70b-versatile` → 404) 전체 AI 기능이 죽었던 적 있음.
알라딘 카테고리 ID도 웹 검색 스니펫으로 추측했다가 틀린 값(에세이인 줄
알았는데 실제론 만화/라이트노벨)이 나온 적 있음.

**그래서 원칙**: 모델명, 카테고리 ID, API 파라미터 값은 코드에 넣기 전에
반드시 실제 API 호출(`curl` 등)로 먼저 검증할 것. 목록 조회 API가 없으면
(`/v1/models` 같은 게 있는 프로바이더는 그걸로, 없으면 실제 값 하나씩
호출해서) 검증 후 사용.

## LLM / 임베딩 — 반드시 무료 티어만

- 생성: `gemini-2.5-flash` (`@google/generative-ai` 사용 — `@google/genai`는
  ESM 전용이라 이 프로젝트의 CommonJS 빌드와 충돌해서 못 씀)
- 임베딩: `gemini-embedding-001`
- **`gemini-2.5-pro`는 2026-04부터 무료 티어 제외됨, 쓰지 말 것.**
  `gemini-2.5-flash-lite`는 2026-10-16 은퇴 예정이라 신규로 넣지 말 것.
- 임베딩 무료 티어는 **하루 1000건** 제한
  (`EmbedContentRequestsPerDayPerUserPerProjectPerModel-FreeTier`). 배치
  시딩처럼 임베딩을 대량으로 만들 때는 이 한도를 염두에 둘 것 — 초과하면
  429가 뜨는데, 스크립트들은 항목별 try/catch로 죽지 않고 스킵하며 계속
  진행하도록 짜여 있음.

## BookEmbedding은 전역 인덱스, 유저 스코프 아님

`BookEmbedding`(책 제목/저자/설명 임베딩)은 `bookId`만 유니크 키로 갖는
전역 콘텐츠 인덱스. `userId` 컬럼 없음 — "누가 이 책을 읽었는지"는
`Bookshelf`가 담당. "내 책장 범위로만 검색"이 필요한 곳(`chat.service.ts`의
RAG 등)은 `Bookshelf`를 조인해서 범위를 잡음. 헷갈리면 안 됨: 이걸 유저
스코프로 다시 되돌리면 알라딘으로 시딩한 공용 추천 후보 풀이 무의미해짐.

`BookshelfEmbedding`은 별개 테이블로, 사용자가 남긴 감상·감정을 임베딩.
이건 여전히 유저 스코프(`userId` 있음) — 개인 감상은 개인 것이니까.

## 추천은 "검색 후 생성", LLM이 책을 지어내면 안 됨

기분/취향 기반 추천(`airecommend.service.ts`)은 LLM에게 책을 자유
생성시키지 않음. 순서: (1) 쿼리를 임베딩 (2) `BookEmbedding` 전역 풀에서
벡터 검색으로 실존하는 후보를 먼저 확보 (3) LLM에게는 그 후보 목록만
주고 "이 중에서 골라서 이유만 설명해" 라고 시킴. 프롬프트에 "후보 목록에
없는 책은 추천 금지"가 항상 들어가야 함 — 이게 빠지면 할루시네이션
(존재하지 않는 책 추천) 리스크가 다시 생김.

후보 풀은 `npm run seed:aladin`(server 디렉터리에서)으로 채움. 알라딘
ItemList API 기반, 카테고리 목록은 `server/src/scripts/seed-aladin-books.ts`
안에 전부 누적 관리됨(재실행해도 이미 임베딩된 책은 스킵하므로 안전).

## 채팅 히스토리는 클라이언트가 아니라 서버 DB 기준

`/chat` 요청 시 클라이언트는 `roomId`와 현재 메시지만 보냄 — 이전 대화
이력을 클라이언트가 body에 실어 보내지 않음. 서버가 `roomId` 소유권을
검증한 뒤 DB에서 최근 12개 메시지를 직접 조회해서 프롬프트에 씀. 스트림은
`AbortController`로 중단 가능하고, 중단/에러 시 SSE로 명시적 이벤트를
보냄 (자세한 이유는 git log의 `refactor(chat)` 커밋 참고).

## 변경 후 검증 순서

1. `npx tsc --noEmit -p tsconfig.json` (server 디렉터리에서)
2. `npx eslint <변경한 파일>`
3. 로컬 Docker DB로 전환해서 실제로 서버 띄우고 curl로 동작 확인
4. 확인 끝나면 DB `.env` 원상복구 + 테스트 데이터 정리 + docker 내리기

커밋 전에 이 네 단계를 건너뛰지 말 것 — 이번 세션에서 이 순서를 안 지켰으면
Groq 모델 404, 스키마 마이그레이션 버그를 못 잡고 그대로 커밋했을 것들이
여럿 있었음.
