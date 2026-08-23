import { NestFactory } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { AppModule } from '../app.module';
import { PrismaService } from '../prisma/prisma.service';

// "취향 추천"의 핵심 retrieval(getSimilarBooks: 최근 5권 각각과 가장 가까운
// 후보를 찾아 합치는 item-based 검색, bookshelf.service.ts::searchByOwnedBooks
// 와 동일한 로직)이 실제로 얼마나 정확한지 Leave-One-Out 방식으로 오프라인
// 검증한다.
//
// 아이디어: 유저가 이미 책장에 담은 책 = "이 유저가 원했던 책"이라는
// 암묵적 정답(implicit ground truth)이다. 그 책 하나를 "모르는 척" 숨기고
// (검색 대상과 후보 제외 목록 양쪽에서 제거), 나머지 책들만으로 추천을
// 돌려서 숨긴 책이 다시 상위에 뜨는지 확인한다. 이걸 모든 유저×책 조합에
// 반복해서 hit-rate@K, MRR을 낸다.
//
// 무작위로 찍었을 때의 기대 성능(baseline)과 반드시 같이 비교해야
// 의미가 있다 — hit-rate 숫자 하나만으로는 "잘하는지" 판단 불가.
//
// (이 스크립트는 프로덕션 retrieval 로직이 바뀔 때마다 같이 맞춰야 한다 —
// 원래 평균 벡터 방식이었다가, 이 스크립트로 실제 검증해서 장르가 섞이면
// 평균이 흐려지는 문제를 발견하고 item-based 방식으로 교체한 이력이 있음.)

const K_CUTOFFS = [8, 20];
const RECENT_N = 5; // getSimilarBooks가 실제로 쓰는 "최근 N권" 값과 동일

interface UserBooks {
  userId: number;
  bookIds: number[]; // createdAt DESC 순서
}

interface Trial {
  userId: number;
  heldOutBookId: number;
  rank: number | null; // 후보 목록에서의 순위(1-indexed). null이면 임베딩 없음 등으로 평가 불가
}

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const prisma = app.get(PrismaService);

  const catalogSizeResult = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT count(*) FROM "BookEmbedding"
  `;
  const catalogSize = Number(catalogSizeResult[0].count);

  const userBooksRows = await prisma.$queryRaw<
    { userId: number; bookIds: number[] }[]
  >`
    SELECT "userId", array_agg("bookId" ORDER BY "createdAt" DESC) as "bookIds"
    FROM "Bookshelf"
    GROUP BY "userId"
    HAVING count(*) >= 2
  `;

  const userBooks: UserBooks[] = userBooksRows.map((r) => ({
    userId: r.userId,
    bookIds: r.bookIds,
  }));

  if (userBooks.length === 0) {
    console.log(
      '책을 2권 이상 가진 유저가 없어서 leave-one-out 평가를 할 수 없어요.',
    );
    await app.close();
    return;
  }

  const trials: Trial[] = [];

  for (const user of userBooks) {
    for (const heldOutBookId of user.bookIds) {
      const remaining = user.bookIds.filter((id) => id !== heldOutBookId);
      const recentRemaining = remaining.slice(0, RECENT_N);

      if (recentRemaining.length === 0) {
        trials.push({ userId: user.userId, heldOutBookId, rank: null });
        continue;
      }

      // remaining(숨긴 책 제외 나머지)만 "이미 아는 책"으로 제외 — 숨긴
      // 책은 다시 후보로 나올 수 있게 둔다. searchByOwnedBooks와 동일하게
      // 최근 5권(숨긴 책 제외) 각각과의 거리 중 최소값으로 전체 카탈로그
      // 순위를 매겨서 hit-rate뿐 아니라 MRR까지 뽑는다.
      const excludeKnownFilter =
        remaining.length > 0
          ? Prisma.sql`AND b.id NOT IN (${Prisma.join(remaining)})`
          : Prisma.empty;

      const rankResult = await prisma.$queryRaw<{ rank: bigint }[]>`
        WITH recent_books AS (
          SELECT be.embedding
          FROM "BookEmbedding" be
          WHERE be."bookId" = ANY(${recentRemaining})
        ),
        ranked AS (
          SELECT b.id, ROW_NUMBER() OVER (
            ORDER BY MIN(be.embedding <=> rb.embedding)
          ) as rank
          FROM "Book" b
          JOIN "BookEmbedding" be ON be."bookId" = b.id
          CROSS JOIN recent_books rb
          WHERE 1=1 ${excludeKnownFilter}
          GROUP BY b.id
        )
        SELECT rank FROM ranked WHERE id = ${heldOutBookId}
      `;

      const rank = rankResult[0] ? Number(rankResult[0].rank) : null;
      trials.push({ userId: user.userId, heldOutBookId, rank });
    }
  }

  const validTrials = trials.filter(
    (t): t is Trial & { rank: number } => t.rank !== null,
  );
  const skipped = trials.length - validTrials.length;

  console.log(
    `\n총 ${trials.length}건 시도, 유효 ${validTrials.length}건 (평가 불가 ${skipped}건), 카탈로그 크기 ${catalogSize}권\n`,
  );

  if (userBooks.length === 1) {
    console.log(
      '⚠️  유저가 1명뿐이라 표본이 작아요 — 이 결과는 경향성 참고용이지 통계적으로 확정적인 수치는 아니에요.\n',
    );
  }

  if (validTrials.length === 0) {
    console.log('유효한 시도가 없어서 지표를 계산할 수 없어요.');
    await app.close();
    return;
  }

  const mrr =
    validTrials.reduce((sum, t) => sum + 1 / t.rank, 0) / validTrials.length;

  console.log('K  | hit-rate | 랜덤 baseline | 배율');
  for (const k of K_CUTOFFS) {
    const hitRate =
      validTrials.filter((t) => t.rank <= k).length / validTrials.length;
    const randomBaseline = k / catalogSize;
    const multiplier = randomBaseline > 0 ? hitRate / randomBaseline : NaN;
    console.log(
      `${String(k).padEnd(3)}| ${(hitRate * 100).toFixed(1).padStart(6)}%  | ${(randomBaseline * 100).toFixed(2).padStart(6)}%       | ${multiplier.toFixed(1)}x`,
    );
  }

  // 랜덤일 때 기대 MRR = (1/catalogSize) * H(catalogSize) (조화급수)
  let harmonic = 0;
  for (let i = 1; i <= catalogSize; i++) harmonic += 1 / i;
  const randomMrr = harmonic / catalogSize;

  console.log(
    `\nMRR: ${mrr.toFixed(4)} (랜덤 baseline: ${randomMrr.toFixed(4)}, 배율: ${(mrr / randomMrr).toFixed(1)}x)`,
  );

  console.log('\n개별 시도 상세:');
  for (const t of validTrials) {
    console.log(
      `  user=${t.userId} bookId=${t.heldOutBookId} → rank=${t.rank}`,
    );
  }

  await app.close();
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
