import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

// 무드/취향/채팅 추천이 실제로 "책장에 담기는" 전환으로 이어졌는지 측정.
// RecommendationLog(추천 노출 로그)와 Bookshelf(실제 담긴 책)를 대조해서
// source별 노출 수 대비 전환 수 · 전환율을 출력한다.
//
// userId가 null인 로그(비로그인 무드 추천)는 이후 전환 여부를 추적할 방법이
// 없어서 집계에서 제외한다 — 표시되는 전환율은 "로그인 상태에서 추천받은
// 것" 기준.

interface StatsRow {
  source: string;
  recommended_count: bigint;
  converted_count: bigint;
}

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  const rows = await prisma.$queryRaw<StatsRow[]>`
    SELECT
      rl.source,
      COUNT(DISTINCT (rl."userId", rl."bookId")) AS recommended_count,
      COUNT(DISTINCT (rl."userId", rl."bookId")) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM "Bookshelf" bs
          WHERE bs."userId" = rl."userId" AND bs."bookId" = rl."bookId"
        )
      ) AS converted_count
    FROM "RecommendationLog" rl
    WHERE rl."userId" IS NOT NULL
    GROUP BY rl.source
    ORDER BY rl.source
  `;

  const anonymousCount = await prisma.recommendationLog.count({
    where: { userId: null },
  });

  if (rows.length === 0) {
    console.log(
      '아직 로그인 상태에서 기록된 추천 로그가 없어요. 추천 기능을 몇 번 사용한 뒤 다시 실행해 주세요.',
    );
  } else {
    console.log('\n추천 → 책장 담기 전환율 (source별)\n');
    console.log(
      'source'.padEnd(10) +
        '노출(고유 user·book)'.padEnd(24) +
        '전환'.padEnd(10) +
        '전환율',
    );
    for (const row of rows) {
      const recommended = Number(row.recommended_count);
      const converted = Number(row.converted_count);
      const rate = recommended > 0 ? (converted / recommended) * 100 : 0;
      console.log(
        row.source.padEnd(10) +
          String(recommended).padEnd(24) +
          String(converted).padEnd(10) +
          `${rate.toFixed(1)}%`,
      );
    }
  }

  if (anonymousCount > 0) {
    console.log(
      `\n(참고: 비로그인 무드 추천 ${anonymousCount}건은 전환 추적 불가로 위 집계에서 제외됨)`,
    );
  }

  await app.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
