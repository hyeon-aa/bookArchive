import { Injectable, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { AiService } from 'src/ai/ai.service';
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
  private readonly HISTORY_LIMIT = 12;

  constructor(
    private readonly aiService: AiService,
    private readonly embeddingService: EmbeddingService,
    private readonly prisma: PrismaService,
  ) {}

  private async retrieveRelatedBooks(query: string, userId: number) {
    //질문을 벡터로 변환
    const queryVector = await this.embeddingService.createEmbedding(query);
    //pgvector에 넣으려면 문자열로 변환
    const vectorStr = JSON.stringify(queryVector);

    // 책 내용(BookEmbedding)과 사용자의 감상/감정(BookshelfEmbedding) 양쪽에서
    // 후보를 찾고, 책별로 더 가까운(distance가 작은) 쪽을 채택해서 상위 5권만 가져옴.
    // 예: "위로받은 책 뭐였지?" 같은 질문은 책 설명이 아니라 사용자가 남긴 감상과
    // 가까울 수 있어서, 감상 임베딩 쪽으로도 검색이 걸려야 함.
    const books = await this.prisma.$queryRaw<RelatedBook[]>`
  WITH candidates AS (
    SELECT "bookId", embedding <=> ${vectorStr}::vector AS distance
    FROM "BookEmbedding"
    WHERE "userId" = ${userId}
    UNION ALL
    SELECT "bookId", embedding <=> ${vectorStr}::vector AS distance
    FROM "BookshelfEmbedding"
    WHERE "userId" = ${userId}
  ),
  best AS (
    SELECT "bookId", MIN(distance) AS distance
    FROM candidates
    GROUP BY "bookId"
  )
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
  FROM best
  JOIN "Book" b ON b.id = best."bookId"
  LEFT JOIN "Bookshelf" bs
    ON bs."bookId" = best."bookId" AND bs."userId" = ${userId}
  ORDER BY best.distance
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
    const roomId = Number(dto.roomId);

    // 2. 만약 roomId가 NaN이거나 0(비어있음)이라면 에러 응답 후 종료
    if (!roomId || isNaN(roomId)) {
      console.error('유효하지 않은 roomId:', dto.roomId);
      res.status(400).end(); // 에러 상태코드를 보내서 프론트에 알려줌
      return;
    }

    // 3. 채팅방 소유자 검증 (다른 사용자의 방에 메시지를 꽂아넣지 못하게)
    const room = await this.prisma.chatRoom.findFirst({
      where: { id: roomId, userId },
    });

    if (!room) {
      res.status(403).end();
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    // 클라이언트가 멈춤 버튼을 누르거나 연결이 끊기면 LLM 호출도 함께 취소
    let clientDisconnected = false;
    const controller = new AbortController();
    res.on('close', () => {
      clientDisconnected = true;
      controller.abort();
    });

    try {
      const relatedBooks = await this.retrieveRelatedBooks(dto.message, userId);
      const context = this.buildContext(relatedBooks);

      // 클라이언트가 보낸 값이 아니라, DB에 저장된 히스토리를 직접 조회
      const recentMessages = await this.prisma.chatMessage.findMany({
        where: { roomId },
        orderBy: { createdAt: 'desc' },
        take: this.HISTORY_LIMIT,
      });
      const history = recentMessages.reverse();

      if (history.length === 0) {
        await this.prisma.chatRoom.update({
          where: { id: roomId },
          data: { title: dto.message.slice(0, 20) },
        });
      }

      await this.prisma.chatMessage.create({
        data: { roomId, role: 'user', content: dto.message },
      });

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
          role: h.role as 'user' | 'assistant',
          content: h.content,
        })),
        {
          role: 'user' as const,
          content: dto.message,
        },
      ];

      const stream = await this.aiService.generateStreamCompletion(
        messages,
        controller.signal,
      );

      let fullResponse = '';

      for await (const chunk of stream) {
        const text = chunk.choices[0].delta?.content;
        //chunk 구조: { choices: [{ delta: { content: "안" } }] }
        if (text) {
          fullResponse += text;
          if (!clientDisconnected) {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
            //SSE 형식: "data: {text}\n\n"
          }
        }
      }

      if (fullResponse) {
        await this.prisma.chatMessage.create({
          data: { roomId, role: 'assistant', content: fullResponse },
        });
      }

      if (!clientDisconnected) {
        res.write(`data: ${JSON.stringify({ done: true, relatedBooks })}\n\n`);
      }
    } catch (error) {
      console.log('[Stream Error]', error);
      if (!clientDisconnected) {
        res.write(
          `data: ${JSON.stringify({ error: '답변을 생성하지 못했어요. 다시 시도해 주세요.' })}\n\n`,
        );
      }
    } finally {
      if (!res.writableEnded) {
        res.end();
      }
    }
  }

  async createRooms(userId: number) {
    return this.prisma.chatRoom.create({
      data: { userId },
    });
  }

  async getRooms(userId: number) {
    return this.prisma.chatRoom.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getChatRoomItem(userId: number, roomId: number) {
    const room = await this.prisma.chatRoom.findFirst({
      where: { id: roomId, userId },
    });

    if (!room) throw new NotFoundException('채팅방을 찾을 수 없어요.');

    return this.prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async deleteChats(userId: number, chatIds: number[]) {
    return this.prisma.$transaction(async (tx) => {
      const { count } = await tx.chatRoom.deleteMany({
        where: {
          id: { in: chatIds },
          userId,
        },
      });

      return { success: true, count };
    });
  }
}
