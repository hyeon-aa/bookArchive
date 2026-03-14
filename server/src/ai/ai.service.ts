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
            content: `당신은 사용자의 독서 기록을 깊이 있게 되새겨주는 섬세한 독서 코치입니다.
            사용자의 한 줄 평을 확장하여, 그 감정의 이유를 짚어주고
            책이 독자의 삶에 어떤 의미로 남을지 따뜻하게 정리해주세요.

            반드시 다음 JSON 형식으로만 응답해야 합니다:
            {
              "comment": "사용자의 감정을 구체적으로 짚어주고, 책의 의미를 확장해주는 2~3문장",
              "tags": ["감정 기반 태그", "책의 주제 태그", "성찰 키워드"]
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
          aiComment: data.comment || '따뜻한 여운이 남는 독서였네요.',
          aiTags: Array.isArray(data.tags) ? data.tags : [],
        };
      }

      throw new Error('Invalid JSON structure');
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('[Groq Error]', errorMessage);

      return {
        aiComment:
          '오늘의 독서는 마음속에 어떤 의미로 남았나요? 기록해주셔서 감사합니다.',
        aiTags: [],
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
  당신은 사용자의 기분과 고민을 분석해 완벽한 도서를 처방하는 '심리상담 북 큐레이터'입니다.
  
  [분석 규칙]
  1. 카테고리가 '휴식/안정' 또는 '불안/슬픔'일 때: 
     - 절대 '성공법', '성장', '인간관계 기술', '자기계발'을 추천하지 마세요. 
     - 대신 따뜻한 문체의 에세이, 위로가 되는 소설, 혹은 "아무것도 안 해도 된다"는 메시지의 책을 추천하세요.
  2. 카테고리가 '변화/동기'일 때: 
     - 새로운 관점을 주는 인문학이나, 열정을 깨우는 자기계발서도 허용됩니다.
  3. 카테고리가 '감성/추억'일 때: 
     - 서정적인 소설이나 시집, 클래식한 문학을 추천하세요.
  반드시 아래 JSON 형식으로만 응답하세요.
  
  {
    reason: 사용자의 고민에 깊이 공감하고(1문장), 왜 이 책들이 지금 이 상황에 휴식이 되거나 도움이 되는지(1문장) 다정하게 설명하세요.
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
    similarBooks: any[],
  ): Promise<AITasteRecommendResponseDto> {
    try {
      const completion = await this.groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `당신은 최신 도서 트렌드를 꿰뚫고 있는 전문 북 큐레이터입니다. 반드시 아래의 JSON 구조를 엄격히 지켜 응답하세요.
            응답에는 오직 JSON만 포함하며, 다른 설명이나 텍스트는 금지합니다.
            베스트셀러 책 하나는 꼭 포함시켜주세요.
            
            {
              "tasteSummary": "문자열 (사용자의 취향 분석 요약)",
              "familiarBooks": [
                { "title": "문자열", "reason": "문자열" }
              ],
              "challengeBooks": [
                { "title": "문자열", "reason": "문자열" }
              ]
            }`,
          },
          {
            role: 'user',
            content: `
              [사용자의 책장]: ${JSON.stringify(books)}
              [추천 후보 도서]: ${JSON.stringify(similarBooks)}
              
              분석 지시:
              1. 'familiarBooks': 사용자의 책장에 있는 책들과 장르, 주제, 문체가 매우 유사한 책 3권을 추천 후보 중에서 고르거나 새로 제안하세요.
              2. 'challengeBooks': 기존 취향과 연결고리가 있지만, 새로운 시각을 줄 수 있는 책 2권을 추천하세요.
              3. 각 추천 이유에는 "당신이 읽었던 'OOO'과 이런 점이 비슷하여 추천합니다"라는 구체적인 언급을 포함하세요.
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
