import { Injectable } from '@nestjs/common';
import { EmbeddingService } from 'src/embedding/embedding.service';

// "추천해달라"는 의도를 대표하는 예시 문장들. 정확한 문구를 맞히려는 게
// 아니라, 임베딩 공간에서 "추천 의도"가 대략 어느 위치인지 기준점을
// 찍어두는 용도. 표현이 이 예시들과 문자 그대로 안 겹쳐도, 의미가
// 비슷하면 임베딩 유사도로 걸린다 (키워드 매칭과의 핵심 차이).
const RECOMMEND_INTENT_EXAMPLES = [
  '비슷한 책 추천해줘',
  '이거랑 비슷한 책 있어?',
  '같은 책 없어?',
  '더 읽을만한 책 없을까',
  '이런 느낌의 책 또 없나',
  '다른 책도 추천해줘',
  '이거 말고 또 읽을 거 없어?',
  '내 취향에 맞는 책 알려줘',
];

// TODO: 아직 실제 유사도 값으로 튜닝 못 함 — 임베딩 무료 티어 하루 1000건
// 할당량이 소진돼서 오늘은 검증 불가. 할당량 리셋되면 실제 문장 여러 개로
// 유사도 분포를 찍어보고 이 값을 조정할 것.
const SIMILARITY_THRESHOLD = 0.7;

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

@Injectable()
export class RecommendationIntentService {
  // 서버 인스턴스 생명주기 동안 한 번만 계산해서 캐싱 (요청마다 재계산 안 함)
  private anchorVectorsPromise: Promise<number[][]> | null = null;

  constructor(private readonly embeddingService: EmbeddingService) {}

  private getAnchorVectors(): Promise<number[][]> {
    if (!this.anchorVectorsPromise) {
      this.anchorVectorsPromise = Promise.all(
        RECOMMEND_INTENT_EXAMPLES.map((example) =>
          this.embeddingService.createEmbedding(example),
        ),
      ).catch((error: unknown) => {
        // 실패한 프로미스를 그대로 캐싱해두면, 할당량이 나중에 풀려도
        // 재시도 없이 계속 같은 실패만 반환하게 됨(서버 재시작 전까지
        // 영구 고장). 실패 시 캐시를 비워서 다음 호출이 다시 시도하게 함.
        this.anchorVectorsPromise = null;
        throw error;
      });
    }
    return this.anchorVectorsPromise;
  }

  // queryVector: 호출부에서 이미 계산해둔 사용자 메시지 임베딩을 그대로
  // 전달받는다 — 추천 의도 판단만을 위해 별도로 임베딩 API를 다시 부르지 않음.
  async isRecommendationIntent(queryVector: number[]): Promise<boolean> {
    const anchors = await this.getAnchorVectors();
    const maxSimilarity = Math.max(
      ...anchors.map((anchor) => cosineSimilarity(queryVector, anchor)),
    );
    return maxSimilarity >= SIMILARITY_THRESHOLD;
  }
}
