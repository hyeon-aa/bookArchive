---
name: aladin-reseed
description: 알라딘 배치 시딩 스크립트를 다시 돌려서 추천 후보 풀을 채우거나 카테고리를 백필할 때 사용. "알라딘 시딩 다시 돌려줘", "책 풀 더 채워줘", "카테고리 백필해줘" 같은 요청에 사용.
---

# 알라딘 배치 시딩 재실행

`server/src/scripts/seed-aladin-books.ts`의 `SEED_CATEGORIES`는 지금까지
검증된 카테고리를 전부 누적 관리한다. 이미 임베딩된 책은 건너뛰므로
재실행해도 안전하지만, 몇 가지 주의할 게 있다.

## 실행 전 체크

1. **로컬 DB로 전환돼 있는지 확인** (`local-db-test` 스킬 참고). 운영 DB에
   직접 시딩하지 않는다.
2. **임베딩 무료 티어 잔여 할당량 확인** — `gemini-embedding-1.0`은 하루
   1000건 제한. 오늘 이미 많이 썼으면 신규 임베딩은 대부분 429로 실패하고
   스킵된다 (스크립트가 죽지는 않음). 정말 새 책을 늘리고 싶으면 할당량이
   리셋된 다음 날 돌릴 것.
3. **카테고리만 백필하고 싶은 경우**(새 카테고리 추가 없이 기존 책에
   `category` 컬럼만 채우고 싶을 때)는 할당량과 무관하게 안전하게 돌려도
   됨 — `upsert`의 `update` 절이 임베딩 생성 여부와 무관하게 먼저
   실행되기 때문.

## 실행

```bash
cd server && npm run seed:aladin
```

완료 로그의 `Book upsert / 신규 임베딩 / 스킵` 숫자를 확인:
- **신규 임베딩이 0에 가깝고 스킵이 대부분** → 이미 다 커버된 카테고리라는 뜻. 새 카테고리를 추가해야 풀이 늘어남 (아래 참고)
- **429 에러 로그가 섞여 있음** → 할당량 소진. 정상, 그냥 스킵되고 계속 진행됨

## 새 카테고리를 추가하고 싶으면

카테고리 ID를 절대 추측하지 말고, `api-verifier` 서브에이전트로 먼저
실제 호출해서 검증한 뒤에 `SEED_CATEGORIES`에 추가한다:

```bash
curl -sL "https://www.aladin.co.kr/ttb/api/ItemList.aspx?ttbkey=<TTB_KEY>&QueryType=Bestseller&CategoryId=<시도할ID>&MaxResults=1&start=1&SearchTarget=Book&output=js&Version=20131101"
```

응답의 `searchCategoryName`이 기대한 장르명과 일치하는지 확인 후 추가.
새 카테고리를 추가했다면, 무드 기반 추천의 장르 필터가 이 카테고리를
참조하게 하려면 `server/src/airecommend/constants/mood-category-map.ts`의
`GROUP_TO_CATEGORIES`에도 카테고리 이름을 추가해야 함 (안 하면 그냥
안 쓰이는 채로 남을 뿐 에러는 안 남).

## 완료 후

- 로컬 DB 원상복구 (`local-db-test` 스킬의 정리 단계)
- 결과를 사용자에게 요약해서 보고: 총 풀 크기, 이번에 늘어난 권수, 할당량 소진 여부
