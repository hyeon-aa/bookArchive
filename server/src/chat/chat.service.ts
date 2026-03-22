import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';
import { aiService } from 'src/ai/ai.service';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChatMessageDto } from './dto/chat-dto';

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
    const queryVector = await this.embeddingService.createEmbedding(query);
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
  ORDER BY be.embedding <=> ${Prisma.raw(`'${vectorStr}'`)}::vector
  LIMIT 5
`;
    return books;
  }

  //자연어로 바꾸기
  private buildContext(books: RelatedBook[]): string {
    if (books.length === 0) return '';

    const STATUS_MAP: Record<string, string> = {
      DONE: '읽음',
      READING: '읽는 중',
      BEFORE: '읽기 전',
    };

    const bookList = books
      .map((book) => {
        const status = book.status
          ? (STATUS_MAP[book.status] ?? book.status)
          : '정보 없음';

        const lines = [
          `- 제목: ${book.title} | 저자: ${book.author}`,
          `  독서 상태: ${status}`,
          book.comment ? `  사용자 감상: ${book.comment}` : '',
          book.emotion ? `  사용자 감정: ${book.emotion}` : '',
          book.aiTags?.length ? `  AI 태그: ${book.aiTags.join(', ')}` : '',
          // ↓ 추가
          book.startDate
            ? `  독서 시작일: ${new Date(book.startDate).toLocaleDateString('ko-KR')}`
            : '',
          book.endDate
            ? `  독서 완료일: ${new Date(book.endDate).toLocaleDateString('ko-KR')}`
            : '',
        ];
        return lines.filter(Boolean).join('\n');
      })
      .join('\n\n');

    return `\n\n[사용자의 책장 정보]\n${bookList}`;
  }

  // SSE 헤더 설정
  async streamChat(userId: number, dto: ChatMessageDto, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    try {
      const relatedBooks = await this.retrieveRelatedBooks(dto.message, userId);

      const context = this.buildContext(relatedBooks);
      const history = dto.history ?? [];

      const messages = [
        {
          role: 'system' as const,
          content: `당신은 사용자의 독서 기록을 깊이 이해하는 따뜻한 북 큐레이터입니다.
  아래의 책장 정보를 바탕으로 사용자의 질문에 친절하고 자연스럽게 답해주세요.
  
  [답변 지침]
  - "내가 이 책 읽었어?" 같은 질문엔 status를 확인해서 정확하게 답하세요.
  - 사용자의 감상(comment)이나 감정(emotion)이 있으면 그걸 언급하며 공감해주세요.
  - 독서 기간이 있으면 자연스럽게 녹여서 답해주세요.
  - 책 추천은 AI 태그와 감정 데이터를 참고해서 취향에 맞게 해주세요.
  - 책장에 없는 책에 대한 질문엔 솔직하게 "책장에 없어요"라고 말해주세요.
  - 답변은 간결하고 따뜻하게, 한국어로 해주세요.${context}`,
        },
        ...history.map((h) => ({
          role: h.role,
          content: h.content,
        })),
        {
          role: 'user' as const,
          content: dto.message,
        },
      ];

      const stream = await this.aiService.generateStreamCompletion(messages);

      for await (const chunk of stream) {
        const text = chunk.choices[0].delta?.content;
        //chunk 구조: { choices: [{ delta: { content: "안" } }] }
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
          //SSE 형식: "data: {text}\n\n"
        }
      }
      res.write(`data: ${JSON.stringify({ done: true, relatedBooks })}\n\n`);
    } catch (error) {
      console.log('[Stream Error]', error);
    } finally {
      res.end();
    }
  }
}
