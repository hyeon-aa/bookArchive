# 📚 bookArchive
> **Next.js + NestJS + pgvector 기반 RAG AI 북 큐레이터**

<div align="center">
  
  <p align="center">
    <b>사용자의 독서 기록을 학습하고 대화하며, 취향을 분석하는 책 기록 플랫폼</b>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Groq_Llama3-F55036?style=flat-square&logo=lightning&logoColor=white" alt="Groq" />
    <img src="https://img.shields.io/badge/Toss_Payments-0064FF?style=flat-square&logo=toss&logoColor=white" alt="Toss" />
  </p>
  
</div>

---

## ✨ 핵심 기능

### 1. 🎁 내 정보 관리
- **레벨별 캐릭터 부여**: 읽은 책의 개수에 따라 사용자 레벨이 상승합니다.
- **독서 타임라인 및 태그 버블 조회**: 독서 타임라인 및 많이 기록된 태그를 조회합니다.
- **인상깊은 문장 저장**: 인상깊은 문장을 카드형태의 이미지로 저장합니다. 

### 2. 💬 RAG 기반 AI 채팅 (Streaming)
- **내 책장 기반 답변**: 질문을 벡터화하여 내 서재에서 관련 정보를 추출(pgvector)한 뒤 답변합니다.
- **실시간 스트리밍**: SSE(Server-Sent Events)를 통해 AI의 답변을 토큰 단위로 실시간 출력합니다.

### 3. 📊 AI 인사이트 및 리포트
- **AI 태그 & 코멘트**: 독서 감상 기록 시 LLM이 자동으로 책에 대한 맞춤형 태그 3개와 코멘트를 생성합니다.
- **AI 리포트**: 월별 독서 통계와 감정 데이터를 분석하여 AI 리포트를 제공합니다. 

### 4. 📚 내 책장 관리
- **책 검색 및 저장**: 네이버 책 API를 통해 책을 검색하고 내 책장에 저장할 수 있습니다. 
- **3단계 Funnel UX**: 상태 선택 → 감상/감정 → 문장 기록으로 이어지는 체계적인 기록 경험을 제공합니다.
- **취향 기반 큐레이션**: 유사도 검색을 통해 '익숙한 책'과 '도전해볼 만한 책'을 AI가 추천합니다.

### 5. 💳 결제 및 멤버십
- **Toss Payments**: 결제 위젯 연동을 통해 멤버십 가입 및 프리미엄 기능을 제공합니다.
- **보안**: JWT 기반의 인증 시스템으로 결제 및 개인 데이터를 안전하게 보호합니다.

---

## 📁 프로젝트 구조

```text
bookArchive/
├── 🌐 client/      # Next.js 14 (App Router, Feature-based)
│   ├── app/        # Page Layer (Auth Guards)
│   ├── feature/    # Domain Logic (API · Hooks · Components)
│   └── shared/     # Global Store (Zustand) & Common Components
└── ⚙️ server/      # NestJS (Modular Architecture)
    ├── src/        # Domain Modules (Auth, Chat, AI, Payment...)
    └── prisma/     # Vector DB Schema & Migrations
