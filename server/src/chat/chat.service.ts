import { Injectable, NotFoundException } from '@nestjs/common';
import type { Response } from 'express';
import { AiService } from 'src/ai/ai.service';
import { BooksService } from 'src/books/books.service';
import { EmbeddingService } from 'src/embedding/embedding.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { RecommendationLogService } from 'src/recommendation-log/recommendation-log.service';
import { ChatMessageDto } from './dto/chat-dto';
import { RecommendationIntentService } from './recommendation-intent.service';

interface RelatedBook {
  id?: number; // 추천 후보(isOwned: false)만 채워짐 — 전환율 로깅용
  title: string;
  author: string;
  description: string | null;
  status: string | null;
  comment: string | null;
  emotion: string | null;
  startDate: Date | null;
  endDate: Date | null;
  aiTags: string[] | null;
  isOwned: boolean;
}

@Injectable()
export class ChatService {
  private readonly HISTORY_LIMIT = 12;
  private readonly RECOMMEND_CANDIDATE_LIMIT = 5;
  // pgvector 코사인 거리(<=>, 0=완전 동일~2=정반대) 컷오프. 이 값 이하만
  // "내 책장 정보"로 프롬프트에 넣는다 — 없으면 질문과 하나도 안 가까운
  // 책도 "가장 가까운 5권"이라는 이유로 매번 컨텍스트에 끼어들어 답변을
  // 흐림. gemini-embedding-001로 실제 검증(로컬 DB, 책 1000여 권 기준):
  // 실제 관련 있는 질문("마법사 학교 다니는 소년 판타지 추천해줘")은 상위
  // 10개가 0.345~0.37에 몰림. 책과 무관한 질문("비밀번호 어떻게 바꿔?")은
  // 가장 가까운 책조차 0.39부터 시작해서 급격히 멀어짐. 그 사이인 0.38을
  // 컷오프로 둠 — 표본이 질문 2개뿐이라 추후 실사용 로그로 재검증 필요.
  private readonly RETRIEVAL_MAX_DISTANCE = 0.38;

  constructor(
    private readonly aiService: AiService,
    private readonly embeddingService: EmbeddingService,
    private readonly booksService: BooksService,
    private readonly recommendationIntentService: RecommendationIntentService,
    private readonly recommendationLogService: RecommendationLogService,
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
    // BookEmbedding은 이제 전역 인덱스라 Bookshelf를 조인해서 "내 책"으로만 범위를 좁힘
    // (채팅은 기본적으로 사용자 자신의 독서 기록에 답하는 기능이라, 전역 풀 전체를 뒤지면 안 됨).
    const myBooks = await this.prisma.$queryRaw<RelatedBook[]>`
  WITH candidates AS (
    SELECT be."bookId", be.embedding <=> ${vectorStr}::vector AS distance
    FROM "BookEmbedding" be
    JOIN "Bookshelf" bs ON bs."bookId" = be."bookId" AND bs."userId" = ${userId}
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
    bs."aiTags",
    true AS "isOwned"
  FROM best
  JOIN "Book" b ON b.id = best."bookId"
  LEFT JOIN "Bookshelf" bs
    ON bs."bookId" = best."bookId" AND bs."userId" = ${userId}
  WHERE best.distance <= ${this.RETRIEVAL_MAX_DISTANCE}
  ORDER BY best.distance
  LIMIT 5
`;

    // "추천해줘" 류의 의도는 LLM이 아니라 코드(임베딩 유사도)로 판단한다 —
    // 판단 자체를 LLM에 맡기면 매번 그 판단이 맞았는지 검증할 방법이 없음.
    // 이미 위에서 계산해둔 queryVector를 그대로 재사용(임베딩 API 추가 호출 없음).
    // 이때만 "내 책"이 아니라 전역 후보 풀(알라딘 시딩분 포함)까지 검색 범위를
    // 넓히되, 이미 가진 책은 코드 레벨에서 제외한다(SQL WHERE, LLM 판단 아님).
    let recommendedBooks: RelatedBook[] = [];
    if (
      await this.recommendationIntentService.isRecommendationIntent(queryVector)
    ) {
      const candidates = await this.booksService.searchByVector(
        vectorStr,
        this.RECOMMEND_CANDIDATE_LIMIT,
        undefined,
        userId,
      );
      recommendedBooks = candidates.map((c) => ({
        id: c.id,
        title: c.title,
        author: c.author,
        description: c.description,
        status: null,
        comment: null,
        emotion: null,
        startDate: null,
        endDate: null,
        aiTags: null,
        isOwned: false,
      }));
    }

    return [...myBooks, ...recommendedBooks];
  }

  //자연어로 바꾸기
  private buildContext(books: RelatedBook[]): string {
    if (books.length === 0) return '';

    const STATUS_MAP: Record<string, string> = {
      DONE: '읽음',
      READING: '읽는 중',
      BEFORE: '읽기 전',
    };

    const renderBook = (book: RelatedBook) => {
      const status = book.status
        ? (STATUS_MAP[book.status] ?? book.status)
        : '정보 없음';

      const lines = [
        `- 제목: ${book.title} | 저자: ${book.author}`,
        book.isOwned ? `  독서 상태: ${status}` : '',
        book.comment ? `  사용자 감상: ${book.comment}` : '',
        book.emotion ? `  사용자 감정: ${book.emotion}` : '',
        book.aiTags?.length ? `  AI 태그: ${book.aiTags.join(', ')}` : '',
        book.startDate
          ? `  독서 시작일: ${new Date(book.startDate).toLocaleDateString('ko-KR')}`
          : '',
        book.endDate
          ? `  독서 완료일: ${new Date(book.endDate).toLocaleDateString('ko-KR')}`
          : '',
        !book.isOwned && book.description
          ? `  설명: ${book.description.slice(0, 200)}`
          : '',
      ];
      return lines.filter(Boolean).join('\n');
    };

    const myBooks = books.filter((b) => b.isOwned);
    const recommendedBooks = books.filter((b) => !b.isOwned);

    let context = '';
    if (myBooks.length > 0) {
      context += `\n\n[사용자의 책장 정보]\n${myBooks.map(renderBook).join('\n\n')}`;
    }
    if (recommendedBooks.length > 0) {
      context += `\n\n[추천 후보 도서 — 사용자가 아직 읽지 않은 책, 실존이 검증된 책만 포함됨]\n${recommendedBooks.map(renderBook).join('\n\n')}`;
    }
    return context;
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
      const recommendedBooks = relatedBooks.filter((b) => !b.isOwned);

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

      const systemInstruction = `당신은 사용자의 독서 기록을 깊이 이해하는 따뜻한 북 큐레이터입니다.
  아래의 책장 정보를 바탕으로 사용자의 질문에 친절하고 자연스럽게 답해주세요.

  [답변 지침]
  - "내가 이 책 읽었어?", "내 책장에 있어?" 같은, 사용자 자신의 독서 기록을 묻는
    질문엔 [사용자의 책장 정보]의 status를 확인해서 정확하게 답하세요. 거기 없으면
    솔직하게 "책장에 없어요"라고 말해주세요.
  - 사용자의 감상(comment)이나 감정(emotion)이 저장돼 있으면 그걸 언급하며 공감해주세요.
  - 독서 기간이 있으면 자연스럽게 녹여서 답해주세요.
  - [추천 후보 도서]가 함께 주어졌다면, 사용자가 비슷한 책을 추천해달라고 한 것입니다.
    반드시 그 목록에 있는 책 중에서만 추천하세요 — 목록에 없는 책을 지어내면 안 됩니다.
    이 책들은 사용자가 아직 읽지 않은 책이므로 "읽으셨죠" 같은 표현은 쓰지 마세요.
  - 그 외의 일반적인 책 이야기(줄거리, 작가, 문체 등)나 사용자가 나누는 독서
    감상·의견에는 책장 정보에 얽매이지 마세요. 아는 내용은 성실하게 답하고,
    모르면 모른다고 솔직히 말하세요. 사용자가 감상을 나누면 그냥 공감만 하지
    말고, 당신 나름의 시각이나 생각도 곁들여서 진짜 독서 모임 상대처럼
    자연스럽게 대화하세요.
  - 답변은 간결하고 따뜻하게, 한국어로 해주세요.${context}`;

      const messages = [
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
        systemInstruction,
        controller.signal,
      );

      let fullResponse = '';

      for await (const chunk of stream) {
        const text = chunk.text();
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

        // LLM이 실제로 답변에서 언급한 후보만 "노출된 추천"으로 기록.
        // 후보 5권을 다 건넸다고 LLM이 전부 언급하는 건 아니라서, 응답
        // 텍스트에 제목이 실제로 등장했는지 코드 레벨로 대조한다(LLM 판단 아님).
        // 책 제목에 " - 부제" 형태가 흔한데, LLM이 자연스러운 문장에서 부제까지
        // 그대로 반복하는 경우는 거의 없어서 핵심 제목만 잘라내 대조한다.
        const coreTitle = (title: string) => title.split(/\s*[-(（]/)[0].trim();
        const mentionedBookIds = recommendedBooks
          .filter((book) => fullResponse.includes(coreTitle(book.title)))
          .map((book) => book.id)
          .filter((id): id is number => id !== undefined);

        await this.recommendationLogService.logShown(
          userId,
          mentionedBookIds,
          'chat',
        );
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
