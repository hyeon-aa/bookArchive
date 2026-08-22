-- BookEmbedding을 유저 스코프에서 벗어난 전역 콘텐츠 인덱스로 전환.
-- 혹시 남아있을 bookId 중복(같은 책이 여러 행으로 존재하는 경우)은
-- 가장 오래된 행만 남기고 정리한 뒤 unique 제약을 건다.
DELETE FROM "BookEmbedding" a USING "BookEmbedding" b
WHERE a.id > b.id AND a."bookId" = b."bookId";

ALTER TABLE "BookEmbedding" DROP COLUMN "userId";

CREATE UNIQUE INDEX "BookEmbedding_bookId_key" ON "BookEmbedding"("bookId");
