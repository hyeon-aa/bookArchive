import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk'; // npm install groq-sdk
import { DailyQuoteResponseDto } from 'src/airecommend/dto/ai-recommend.dto';
import { AIRecommendDraft } from 'src/airecommend/types/ai-recommend.type';
import { AITagRequestDto } from './ai-request.dto';
import {
  AITagResponseDto,
  AITasteRecommendResponseDto,
} from './ai-response.dto';

@Injectable()
export class aiService {
  private readonly groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  async generateCommentAndTags(
    input: AITagRequestDto,
  ): Promise<AITagResponseDto> {
    try {
      const chatCompletion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `당신은 독서 기록을 도와주는 다정한 AI 조언자입니다.
            반드시 다음 JSON 형식으로만 응답해야 합니다:
            {
              "comment": "독자의 감정에 공감하고 책의 의미를 되새겨주는 따뜻한 한마디 (2~3문장)",
              "tags": ["태그1", "태그2", "tags3"]
            }`,
          },
          {
            role: 'user',
            content: `[책 제목]: ${input.bookTitle}
            [사용자의 한 줄 평]: ${input.review}
            [사용자의 감정]: ${input.emotion}`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const rawContent = chatCompletion.choices[0]?.message?.content;

      if (!rawContent) {
        throw new Error('No content returned from Groq');
      }

      const parsed: unknown = JSON.parse(rawContent);

      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'comment' in parsed &&
        'tags' in parsed
      ) {
        const data = parsed as { comment: string; tags: string[] };
        return {
          comment: data.comment || '따뜻한 여운이 남는 독서였네요.',
          tags: Array.isArray(data.tags) ? data.tags : [],
        };
      }

      throw new Error('Invalid JSON structure');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('[Groq Error]', errorMessage);

      return {
        comment:
          '오늘의 독서는 마음속에 어떤 의미로 남았나요? 기록해주셔서 감사합니다.',
        tags: [],
      };
    }
  }

  async generateBookRecommendations(
    currentMood: string,
    userTalk: string,
  ): Promise<AIRecommendDraft> {
    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `
  당신은 독서 큐레이터 AI입니다.
  반드시 아래 JSON 형식으로만 응답하세요.
  
  {
    "reason": "이 감정 조합에 왜 이 책들이 어울리는지 설명 (1~2문장)",
    "books": [
      { "title": "책 제목", "author": "저자" }
    ]
  }
            `,
          },
          {
            role: 'user',
            content: `
              [현재 무드]: ${currentMood} 
              [사용자의 고민/상황]: ${userTalk} 
          
              위의 무드와 상황을 겪고 있는 사용자에게 가장 필요한 책을 3권 추천해줘.
              - 현재 무드가 '지친' 상태이고 고민이 '인간관계'라면, 위로가 되거나 관계의 기술을 알려주는 책 위주로.
              - 단순히 제목 매칭이 아니라, 사용자의 마음을 어루만져 줄 수 있는 '독서 처방' 관점에서 골라줘.
            `,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) {
        throw new Error('No content returned from Groq');
      }

      console.log('[Groq Book Recommendation RAW]', raw);

      const parsed: unknown = JSON.parse(raw);

      // 타입 가드
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'reason' in parsed &&
        'books' in parsed
      ) {
        const data = parsed as AIRecommendDraft;
        return {
          reason: data.reason || '당신에게 어울리는 책을 추천합니다.',
          books: Array.isArray(data.books) ? data.books : [],
        };
      }

      throw new Error('Invalid JSON structure');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('[Book Recommendation Error]', errorMessage);

      // 폴백 응답
      return {
        reason: '추천을 생성하는 중 오류가 발생했습니다.',
        books: [],
      };
    }
  }

  async generateDailyQuote(): Promise<DailyQuoteResponseDto> {
    try {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: 'numeric',
        timeZone: 'Asia/Seoul',
      };
      const dateString = now.toLocaleDateString('ko-KR', options);
      const month = now.getMonth() + 1;
      const season =
        month >= 3 && month <= 5
          ? '봄'
          : month >= 6 && month <= 8
            ? '여름'
            : month >= 9 && month <= 11
              ? '가을'
              : '겨울';

      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              '당신은 독서 큐레이터 AI입니다. 반드시 JSON 형식으로만 응답하세요.',
          },
          {
            role: 'user',
            content: `오늘은 ${dateString}, ${season}의 시간입니다. 이 시간과 계절에 어울리는 책 속 명문장을 추천해주세요.
          응답 형식:
          {
            "quote": "문장",
            "bookTitle": "제목",
            "author": "저자",
            "context": "맥락",
            "reason": "추천이유"
          }`,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.8,
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error('No content returned');

      const parsed: unknown = JSON.parse(raw);

      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'quote' in parsed &&
        'bookTitle' in parsed &&
        'author' in parsed
      ) {
        return parsed as DailyQuoteResponseDto;
      }

      throw new Error('Invalid JSON structure');
    } catch (error: unknown) {
      console.error('[Daily Quote Error]', error);
      return {
        quote: '삶이 있는 한 희망은 있다.',
        bookTitle: '그리스 로마 신화',
        author: '키케로',
        context: '희망의 중요성을 강조하는 격언입니다.',
        reason: '시스템 오류로 인해 기본 문장을 전달해 드립니다.',
      };
    }
  }

  async generateTasteBasedRecommendations(
    books: { title: string; author: string; status: string }[],
  ): Promise<AITasteRecommendResponseDto> {
    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `
  당신은 독서 취향을 분석해주는 섬세한 AI 북 큐레이터입니다.
  반드시 아래 JSON 형식으로만 응답하세요.
  
  {
    "tasteSummary": "이 독자가 어떤 독서 취향을 가졌는지 따뜻하게 요약 (1~2문장)",
    "familiarBooks": [
      { "title": "책 제목", "author": "저자", "reason": "왜 이 취향에 잘 맞는지" }
    ],
    "challengeBooks": [
      { "title": "책 제목", "author": "저자", "reason": "왜 새로운 시도로 추천하는지" }
    ]
  }
            `,
          },
          {
            role: 'user',
            content: `
  다음은 사용자의 책장 목록입니다.
  이 독자의 취향을 먼저 요약한 뒤,
  1) 취향에 꼭 맞는 책 3권
  2) 취향을 살짝 확장해볼 수 있는 책 2권
  을 추천해주세요.
  
  [책장 목록]
  ${books.map((b) => `- ${b.title} / ${b.author} (${b.status})`).join('\n')}
            `,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const raw = completion.choices[0]?.message?.content;
      if (!raw) throw new Error('No content returned');

      return JSON.parse(raw) as AITasteRecommendResponseDto;
    } catch (error) {
      console.error('[AI Taste Recommend Error]', error);
      return {
        tasteSummary: '당신의 독서 취향을 분석하는 중이에요.',
        familiarBooks: [],
        challengeBooks: [],
      };
    }
  }
}
