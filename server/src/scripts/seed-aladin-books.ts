import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AladinService } from '../aladin/aladin.service';
import { AladinItem } from '../aladin/types/aladin-item.type';
import { EmbeddingService } from '../embedding/embedding.service';
import { PrismaService } from '../prisma/prisma.service';

// 추천 후보 풀을 미리 채우기 위한 배치 시딩 스크립트.
// 네이버 도서 API엔 목록/베스트셀러 조회가 없어서, 알라딘 카테고리별
// 베스트셀러를 가져와 Book + BookEmbedding에 채워넣는다.
// 카테고리 ID는 전부 실제 API 호출로 검증한 값만 사용 (추측 금지).
//
// 이미 임베딩된 책은 건너뛰므로(아래 existing 체크) 이 스크립트를 다시
// 돌려도 안전 — 그래서 지금까지 써온 카테고리를 전부 이 하나의 목록에
// 누적해서 관리한다. 히스토리:
//   1차: 전체 베스트셀러(0) + 인문/자기계발 계열 → 678권
//   2차: 겹치지 않는 소설 하위 장르(해외소설/판타지/로맨스 등) → 996권
//   (제미나이 임베딩 무료 티어가 하루 1000건이라 여기서 중단, 다음 실행 시 이어감)
const SEED_CATEGORIES: { id: number; name: string; total: number }[] = [
  // 전체 베스트셀러 (알라딘 자체 상한이 1000위까지)
  { id: 0, name: '전체', total: 1000 },
  // 인문/자기계발/실용 계열
  { id: 336, name: '자기계발', total: 100 },
  { id: 55889, name: '에세이', total: 100 },
  { id: 656, name: '인문학', total: 100 },
  { id: 74, name: '역사', total: 100 },
  { id: 517, name: '예술/대중문화', total: 100 },
  { id: 170, name: '경제경영', total: 100 },
  { id: 50976, name: '미술/음악/예술치료', total: 100 },
  { id: 1230, name: '요리/살림', total: 100 },
  { id: 55890, name: '건강/취미', total: 100 },
  { id: 987, name: '과학', total: 100 },
  { id: 51389, name: '종교에세이', total: 100 },
  { id: 798, name: '사회과학', total: 100 },
  // 소설/문학 계열
  { id: 50993, name: '한국소설(2000년대 이후)', total: 100 },
  { id: 50917, name: '한국소설(전체)', total: 100 },
  { id: 50930, name: '과학소설(SF)', total: 100 },
  { id: 50926, name: '추리/미스터리소설', total: 100 },
  { id: 50918, name: '일본소설', total: 100 },
  { id: 50919, name: '영미소설', total: 100 },
  { id: 50920, name: '스페인/중남미소설', total: 50 },
  { id: 50921, name: '프랑스소설', total: 50 },
  { id: 50922, name: '독일소설', total: 50 },
  { id: 50923, name: '중국소설', total: 50 },
  { id: 50925, name: '세계의 소설', total: 100 },
  { id: 50928, name: '판타지/환상문학', total: 100 },
  { id: 50929, name: '역사소설', total: 50 },
  { id: 50931, name: '호러/공포소설', total: 50 },
  { id: 50932, name: '무협소설', total: 50 },
  { id: 51125, name: '한국 로맨스소설', total: 100 },
  { id: 51126, name: '외국 로맨스소설', total: 100 },
  { id: 51173, name: '시화집', total: 100 },
];

// 알라딘 ItemList는 호출당 최대 50건이라(MaxResults 상한), 카테고리당
// 원하는 총량을 여러 페이지(start=1,51,101...)로 나눠서 가져온다.
const PAGE_SIZE = 50;
const DELAY_MS = 300; // 알라딘 API 과호출 방지용 딜레이

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const aladin = app.get(AladinService);
  const embeddingService = app.get(EmbeddingService);
  const prisma = app.get(PrismaService);

  let createdBooks = 0;
  let createdEmbeddings = 0;
  let skipped = 0;

  for (const category of SEED_CATEGORIES) {
    console.log(`\n[${category.name}] 베스트셀러 가져오는 중...`);

    const items: AladinItem[] = [];
    for (let start = 1; start <= category.total; start += PAGE_SIZE) {
      try {
        const page = await aladin.fetchBestsellers(
          category.id,
          PAGE_SIZE,
          start,
        );
        items.push(...page);
        if (page.length < PAGE_SIZE) break; // 더 이상 페이지가 없음
      } catch (error) {
        console.error(`[${category.name}] start=${start} 조회 실패:`, error);
        break;
      }
      await sleep(DELAY_MS);
    }

    for (const item of items) {
      const isbn = item.isbn13;
      if (!isbn) {
        skipped++;
        continue;
      }

      try {
        const book = await prisma.book.upsert({
          where: { isbn },
          update: {},
          create: {
            isbn,
            title: item.title,
            author: item.author,
            imageUrl: item.cover,
            description: item.description ?? '',
          },
        });

        const existing = await prisma.$queryRaw<{ id: number }[]>`
          SELECT id FROM "BookEmbedding" WHERE "bookId" = ${book.id}
        `;

        if (existing.length > 0) {
          skipped++;
          continue;
        }

        const textToEmbed = book.description?.trim()
          ? book.description
          : `${book.title} ${book.author}`;

        const embedding = await embeddingService.createEmbedding(textToEmbed);

        await prisma.$executeRaw`
          INSERT INTO "BookEmbedding" ("bookId", "embedding")
          VALUES (${book.id}, ${JSON.stringify(embedding)}::vector)
          ON CONFLICT ("bookId") DO NOTHING
        `;

        createdEmbeddings++;
        if (book) createdBooks++;
      } catch (error) {
        console.error(`  실패: ${item.title}`, error);
      }

      await sleep(DELAY_MS);
    }
  }

  console.log(
    `\n완료 — Book upsert: ${createdBooks}, 신규 임베딩: ${createdEmbeddings}, 스킵: ${skipped}`,
  );

  await app.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
