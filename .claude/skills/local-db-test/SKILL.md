---
name: local-db-test
description: bookArchive 서버 변경사항을 로컬 Docker Postgres로 실제 검증할 때 사용. "로컬 DB로 테스트해줘", "마이그레이션 검증", "서버 실제로 띄워서 확인" 같은 요청에 사용. Render 원격 DB는 로컬에서 SSL 핸드셰이크 단계에서 막혀 보통 연결이 안 됨.
---

# 로컬 DB 검증

bookArchive의 `server/.env`는 기본적으로 Render 원격 Postgres를 가리키는데,
로컬 환경에서는 대부분 SSL 핸드셰이크 단계에서 연결이 거부된다. 스키마
변경, 마이그레이션, 시딩 스크립트, 새 API 엔드포인트를 실제로 검증하려면
이 절차로 로컬 Docker DB를 띄워서 확인한다.

## 1. Docker DB 기동

```bash
cd <repo root>
POSTGRES_USER=postgres POSTGRES_PASSWORD=password123 POSTGRES_DB=cloud_db \
  docker compose up -d db
```

Docker Desktop이 안 떠 있으면 `docker info`로 확인 후 `open -a Docker`로
띄우고 준비될 때까지 대기.

## 2. `.env`를 로컬 DB로 전환

`server/.env`에서 `DATABASE_URL` 두 줄 중:
- 로컬 줄(`postgresql://postgres:password123@localhost:5433/cloud_db?schema=public`)의 주석을 풀고
- Render 줄은 주석 처리

## 3. 마이그레이션 적용 (스키마 변경이 있는 경우)

```bash
cd server && npx prisma migrate deploy
```

## 4. 서버 기동 및 검증

```bash
cd server
nohup npm run start:dev > /tmp/bookarchive-server.log 2>&1 &
sleep 8 && tail -n 10 /tmp/bookarchive-server.log
```

포트 4000이 이미 점유 중이면 `lsof -ti :4000 | xargs kill -9`로 정리 후
재시도. 로컬 DB에는 기존 개발용 계정(`test3@test.com` / `test3333`)이
남아있어 바로 로그인해서 API를 curl로 호출해볼 수 있다.

검증 예시:
```bash
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test3@test.com","password":"test3333"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

curl -s http://localhost:4000/<엔드포인트> -H "Authorization: Bearer $TOKEN"
```

## 5. 정리 (반드시 수행)

```bash
pkill -f "nest start"
```

`server/.env`를 원상복구(Render 줄 다시 활성화, 로컬 줄 주석 처리)하고:

```bash
cd <repo root> && docker compose stop db
```

테스트 중 만든 계정/방/더미 데이터가 있으면 지우거나, 로컬 DB 전용이라
문제없으면 남겨둬도 됨(다음 세션에서도 재사용).

## 원칙

- 이 절차 없이 Render 프로덕션 DB에 테스트 데이터를 직접 넣지 않는다.
- 검증 없이 "동작할 것 같다"로 커밋하지 않는다 — 이 프로젝트에서 실제로
  타입체크만 통과하고 런타임에서 깨진 경우(Groq 모델 404, Prisma 마이그레이션
  버그)가 여러 번 있었다.
