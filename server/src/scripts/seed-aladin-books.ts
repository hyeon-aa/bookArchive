import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AladinService } from '../aladin/aladin.service';
import { AladinItem } from '../aladin/types/aladin-item.type';
import { EmbeddingService } from '../embedding/embedding.service';
import { PrismaService } from '../prisma/prisma.service';

// 추천 후보 풀을 미리 채우기 위한 배치 시딩 스크립트.
// 네이버 도서 API엔 목록/베스트셀러 조회가 없어서, 알라딘 카테고리별
// 베스트셀러를 가져와 Book + BookEmbedding에 채워넣는다.
// 카테고리 ID는 실제 API 호출로 검증한 값만 사용 (추측 금지).
const SEED_CATEGORIES: { id: number; name: string }[] = [
  { id: 336, name: '자기계발' },
  { id: 55889, name: '에세이' },
  { id: 656, name: '인문학' },
  { id: 50993, name: '한국소설' },
  { id: 74, name: '역사' },
  { id: 517, name: '예술/대중문화' },
  { id: 170, name: '경제경영' },
  { id: 50930, name: '과학소설(SF)' },
];

const MAX_RESULTS_PER_CATEGORY = 50;
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

    let items: AladinItem[];
    try {
      items = await aladin.fetchBestsellers(
        category.id,
        MAX_RESULTS_PER_CATEGORY,
      );
    } catch (error) {
      console.error(`[${category.name}] 조회 실패:`, error);
      continue;
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
