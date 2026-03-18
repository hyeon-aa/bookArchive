-- This is an empty migration.

-- 기존 embedding 컬럼을 확실하게 vector(3072)로 변경
ALTER TABLE "BookEmbedding" ALTER COLUMN "embedding" TYPE vector(3072);