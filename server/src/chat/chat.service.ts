import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { aiService } from 'src/ai/ai.service';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { PrismaService } from 'src/prisma/prisma.service';

interface RelatedBook {
  title: string;
  author: string;
  description: string | null;
  status: string | null;
  comment: string | null;
  emotion: string | null;
  startDate: Date | null;
  endDate: Date | null;
  aiTags: string[] | null;
}

@Injectable()
export class ChatService {
  constructor(
    private readonly aiService: aiService,
    private readonly embeddingService: EmbeddingService,
    private readonly prisma: PrismaService,
  ) {}

  private async retrieveRelatedBooks(query: string, userId: number) {
    //질문을 벡터로 변환
    const queryVector = this.embeddingService.createEmbedding(query);
    //pgvector에 넣으려면 문자열로 변환
    const vectorStr = JSON.stringify(queryVector);

    //질문 벡터랑 가장 가까운 책 5권 가져오기
    const books = await this.prisma.$queryRaw<RelatedBook[]>`
    SELECT
      b.title,
      b.author,
      b.description,
      bs.status,
      bs.comment,
      bs.emotion,
      bs."startDate",
      bs."endDate",
      bs."aiTags"
    FROM "Book" b
    JOIN "BookEmbedding" be ON b.id = be."bookId"
    LEFT JOIN "Bookshelf" bs
      ON bs."bookId" = b.id AND bs."userId" = ${userId}
    WHERE be."userId" = ${userId}
    ORDER BY be.embedding <=> ${vectorStr}::vector
    LIMIT 5
    `;

    return books;
  }

  // SSE 헤더 설정
  async streamChat(res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      const stream = await this.aiService.generateStreamCompletion([
        { role: 'user', content: '안녕하세요' },
      ]);

      for await (const chunk of stream) {
        const text = chunk.choices[0].delta?.content;
        //chunk 구조: { choices: [{ delta: { content: "안" } }] }
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
          //SSE 형식: "data: {text}\n\n"
        }
      }
    } catch (error) {
      console.log('[Stream Error]', error);
    } finally {
      res.end();
    }
  }
}
