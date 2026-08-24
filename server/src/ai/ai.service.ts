import { Injectable } from '@nestjs/common';
import { GenerationConfig, GoogleGenerativeAI } from '@google/generative-ai';
import {
  AiReportRequestDto,
  DailyQuoteResponseDto,
} from 'src/airecommend/dto/ai-recommend.dto';
import { AIRecommendDraft } from 'src/airecommend/types/ai-recommend.type';
import { AITagRequestDto } from './dto/ai-request.dto';
import {
  AIBookReportDto,
  AITagResponseDto,
  AITasteRecommendResponseDto,
} from './dto/ai-response.dto';

// 무료 티어 대상 모델. Pro는 2026-04부터 무료 티어에서 제외됨.
const MODEL = 'gemini-2.5-flash';

// @google/generative-ai(0.24.1, 레거시 SDK)의 GenerationConfig 타입엔
// thinkingConfig가 없지만 REST API 자체는 지원함(curl로 직접 검증).
// gemini-2.5 계열은 기본적으로 내부 reasoning에 토큰을 쓰는데, 이게
// maxOutputTokens 예산을 먹어버려서 실제 응답이 짧은데도 finishReason이
// MAX_TOKENS로 문장 중간에 끊기는 문제가 있었음(채팅에서 재현·확인).
// 여기선 구조화된 JSON 응답이나 정해진 톤의 짧은 답변만 필요해서 thinking이
// 필요 없으므로 전부 끔.
interface GenerationConfigWithThinking extends GenerationConfig {
  thinkingConfig?: { thinkingBudget: number };
}

function noThinking(config: GenerationConfig): GenerationConfigWithThinking {
  return { ...config, thinkingConfig: { thinkingBudget: 0 } };
}

export interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class AiService {
  private readonly genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY ?? '',
  );

  async generateCommentAndTags(
    input: AITagRequestDto,
  ): Promise<AITagResponseDto> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: `당신은 사용자의 독서 기록을 깊이 있게 되새겨주는 섬세한 독서 코치입니다.
            사용자의 한 줄 평을 확장하여, 그 감정의 이유를 짚어주고
            책이 독자의 삶에 어떤 의미로 남을지 따뜻하게 정리해주세요.

            반드시 다음 JSON 형식으로만 응답해야 합니다:
            {
              "comment": "사용자의 감정을 구체적으로 짚어주고, 책의 의미를 확장해주는 2~3문장",
              "tags": ["감정 기반 태그", "책의 주제 태그", "성찰 키워드"]
            }`,
        generationConfig: noThinking({
          temperature: 0.7,
          responseMimeType: 'application/json',
        }),
      });

      const result = await model.generateContent(`[책 제목]: ${input.bookTitle}
            [사용자의 한 줄 평]: ${input.review}
            [사용자의 감정]: ${input.emotion}`);

      const rawContent = result.response.text();

      if (!rawContent) {
        throw new Error('No content returned from Gemini');
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
      console.error('[Gemini Error]', errorMessage);

      return {
        aiComment:
          '오늘의 독서는 마음속에 어떤 의미로 남았나요? 기록해주셔서 감사합니다.',
        aiTags: [],
      };
    }
  }

  async generateBookRecommendations(
    currentMood: string,
    moodGroup: string | null,
    userTalk: string,
    candidates: { title: string; author: string; description: string }[],
  ): Promise<AIRecommendDraft> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: `
  당신은 사용자의 기분과 고민을 분석해 완벽한 도서를 처방하는 '심리상담 북 큐레이터'입니다.

  아래 [후보 도서 목록]에 있는 책 중에서만 골라야 합니다. 목록에 없는 책은
  절대로 추천하지 마세요 — 실존하지 않는 책을 지어내면 안 됩니다.

  [분석 규칙] — 아래 판단은 사용자 입력의 [무드 그룹] 값을 기준으로 하세요.
  1. [무드 그룹]이 '휴식/안정' 또는 '불안/슬픔'일 때:
     - 절대 '성공법', '성장', '인간관계 기술', '자기계발'을 추천하지 마세요.
     - 대신 따뜻한 문체의 에세이, 위로가 되는 소설, 혹은 "아무것도 안 해도 된다"는 메시지의 책을 추천하세요.
  2. [무드 그룹]이 '변화/동기'일 때:
     - 새로운 관점을 주는 인문학이나, 열정을 깨우는 자기계발서도 허용됩니다.
  3. [무드 그룹]이 '감성/추억'일 때:
     - 서정적인 소설이나 시집, 클래식한 문학을 추천하세요.
  4. [무드 그룹]이 '활기/기쁨'일 때:
     - 밝고 몰입감 있는 장르 소설(판타지·추리·SF·로맨스)을 적극 추천하세요.
  5. [무드 그룹]이 비어 있을 때(분류 안 됨):
     - 위 규칙에 얽매이지 말고, [현재 무드]와 [사용자의 고민/상황] 텍스트 자체의 뉘앙스로 판단하세요.
  반드시 아래 JSON 형식으로만 응답하세요.

  {
    reason: 사용자의 고민에 깊이 공감하고(1문장), 왜 이 책들이 지금 이 상황에 휴식이 되거나 도움이 되는지(1문장) 다정하게 설명하세요.
    "books": [
      { "title": "후보 목록에 있는 제목 그대로", "author": "저자" }
    ]
  }
            `,
        generationConfig: noThinking({
          temperature: 0.7,
          responseMimeType: 'application/json',
        }),
      });

      const result = await model.generateContent(`
              [현재 무드]: ${currentMood}
              [무드 그룹]: ${moodGroup ?? '(분류 안 됨)'}
              [사용자의 고민/상황]: ${userTalk}
              [후보 도서 목록]: ${JSON.stringify(candidates)}

              후보 목록 중에서 지금 상황에 가장 필요한 책을 최대 3권 골라줘.
              - 현재 무드가 '지친' 상태이고 고민이 '인간관계'라면, 위로가 되거나 관계의 기술을 알려주는 책 위주로.
              - 단순히 제목 매칭이 아니라, 사용자의 마음을 어루만져 줄 수 있는 '독서 처방' 관점에서 골라줘.
            `);

      const raw = result.response.text();
      if (!raw) {
        throw new Error('No content returned from Gemini');
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

      const model = this.genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction:
          '당신은 독서 큐레이터 AI입니다. 반드시 JSON 형식으로만 응답하세요.',
        generationConfig: noThinking({
          temperature: 0.8,
          responseMimeType: 'application/json',
        }),
      });

      const result = await model.generateContent(
        `오늘은 ${dateString}, ${season}의 시간입니다. 이 시간과 계절에 어울리는 책 속 명문장을 추천해주세요.
          응답 형식:
          {
            "quote": "문장",
            "bookTitle": "제목",
            "author": "저자",
            "context": "맥락",
            "reason": "추천이유"
          }`,
      );

      const raw = result.response.text();
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
    familiarCandidates: {
      title: string;
      author: string;
      description: string;
    }[],
    challengeCandidates: {
      title: string;
      author: string;
      description: string;
    }[],
  ): Promise<AITasteRecommendResponseDto> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: `당신은 최신 도서 트렌드를 꿰뚫고 있는 전문 북 큐레이터입니다. 반드시 아래의 JSON 구조를 엄격히 지켜 응답하세요.
            응답에는 오직 JSON만 포함하며, 다른 설명이나 텍스트는 금지합니다.

            아래에 후보 도서 목록이 두 개 주어집니다. familiarBooks는 반드시
            [취향과 비슷한 후보]에서만, challengeBooks는 반드시 [새로운 장르 후보]
            에서만 골라야 합니다 — 서로 목록을 바꿔서 고르거나, 목록에 없는 책을
            지어내면 안 됩니다.

            {
              "tasteSummary": "문자열 (사용자의 취향 분석 요약)",
              "familiarBooks": [
                { "title": "[취향과 비슷한 후보]에 있는 제목 그대로", "reason": "문자열" }
              ],
              "challengeBooks": [
                { "title": "[새로운 장르 후보]에 있는 제목 그대로", "reason": "문자열" }
              ]
            }`,
        generationConfig: noThinking({
          temperature: 0.7,
          responseMimeType: 'application/json',
        }),
      });

      const result = await model.generateContent(`
              [사용자의 책장]: ${JSON.stringify(books)}
              [취향과 비슷한 후보]: ${JSON.stringify(familiarCandidates)}
              [새로운 장르 후보]: ${JSON.stringify(challengeCandidates)}

              분석 지시:
              1. 'familiarBooks': [취향과 비슷한 후보] 중에서, 사용자의 책장에 있는 책들과 장르·주제·문체가 매우 유사한 책을 최대 3권 고르세요.
              2. 'challengeBooks': [새로운 장르 후보] 중에서, 사용자의 기존 취향과 연결고리가 있으면서도 새로운 시각을 줄 수 있는 책을 최대 2권 고르세요. 이 후보들은 이미 장르 자체가 사용자에게 낯선 것들이니, 왜 그럼에도 시도해볼 만한지에 집중해서 이유를 쓰세요.
              3. 각 추천 이유에는 "당신이 읽었던 'OOO'과 이런 점이 비슷하여 추천합니다"라는 구체적인 언급을 포함하세요.
            `);

      const raw = result.response.text();
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

  // 채팅 검색(RAG)용 질문 재작성. "그거 말고 또 있어?" 같은 메시지는 그
  // 자체를 임베딩해봤자 의미 정보가 거의 없어서 검색이 안 됨 — 직전 대화
  // 맥락을 참고해 "SF 소설 다른 것도 추천해줘"처럼 그 자체로 이해 가능한
  // 질문으로 바꿔서, 그 결과를 검색(임베딩)에만 쓴다. 실제 대화 기록·LLM에게
  // 보여주는 대화 내용(messages)은 원본 그대로 유지 — 여긴 검색 단계
  // 전용이라 사용자가 실제로 뭐라고 썼는지를 바꿔치기하면 안 됨.
  async rewriteQueryForRetrieval(
    history: ChatTurn[],
    currentMessage: string,
  ): Promise<string> {
    // 히스토리가 없으면(첫 메시지) 대명사가 가리킬 맥락 자체가 없으므로
    // 재작성 LLM 호출 없이 바로 반환 — 첫 메시지 지연도 안 생김.
    if (history.length === 0) return currentMessage;

    try {
      const model = this.genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: `당신은 대화 맥락을 참고해 사용자의 마지막 메시지를 "검색에 적합한, 그 자체로 완전히 이해 가능한 질문"으로 다시 쓰는 도우미입니다.

- 마지막 메시지가 이전 대화의 대명사·생략된 주어("그거", "그 책", "또 다른 건")에 의존한다면, 이전 대화에서 그게 뭘 가리키는지 찾아 완전한 문장으로 풀어 쓰세요.
- 이미 그 자체로 독립적인 질문이면 그대로 반환하세요.
- 질문의 의미를 바꾸거나 새로운 내용을 추가하지 마세요 — 대명사·생략을 구체화하는 것뿐입니다.
- 반드시 아래 JSON 형식으로만 응답하세요.

{ "rewrittenQuery": "재작성된 질문 문장" }`,
        generationConfig: noThinking({
          temperature: 0,
          responseMimeType: 'application/json',
        }),
      });

      const historyText = history
        .map((h) => `${h.role === 'user' ? '사용자' : 'AI'}: ${h.content}`)
        .join('\n');

      const result = await model.generateContent(`
        [최근 대화]
        ${historyText}

        [마지막 사용자 메시지]: ${currentMessage}
      `);

      const raw = result.response.text();
      if (!raw) throw new Error('No content returned');

      const parsed = JSON.parse(raw) as { rewrittenQuery?: string };
      return parsed.rewrittenQuery?.trim() || currentMessage;
    } catch (error) {
      // 재작성이 실패해도 검색 자체를 막으면 안 되므로 원래 메시지로 폴백.
      console.error('[Query Rewrite Error]', error);
      return currentMessage;
    }
  }

  async generateStreamCompletion(
    messages: ChatTurn[],
    systemInstruction: string,
    signal?: AbortSignal,
  ) {
    const model = this.genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction,
      generationConfig: noThinking({
        temperature: 0.7,
        maxOutputTokens: 1024,
      }),
    });

    const result = await model.generateContentStream(
      {
        contents: messages.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
      },
      { signal },
    );

    return result.stream;
  }

  async generateAIBookReport(
    myBooks: AiReportRequestDto,
  ): Promise<AIBookReportDto> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: MODEL,
        systemInstruction: `
            당신은 사용자의 한 달 독서 데이터를 분석해 '음식 캐릭터'를 부여하고 리포트를 작성하는 '심리분석 북 큐레이터'입니다.
            반드시 아래의 JSON 구조와 지침을 엄격히 따라 응답하세요.

            [분석 지침]
            1. reportTitle: 이달의 독서 흐름을 관통하는 감성적인 제목 (예: "지친 마음을 보듬어준 문장들의 온기")
            2. topIntent: 사용자가 선택한 '독서 의도' 중 가장 비중이 높은 것을 선정하고, 왜 이 의도가 나타났는지 심리적 통찰(insight)을 제공하세요.
            3. intentVsEmotionAnalysis:
              - summary: 의도와 결과(감정) 사이의 연관성을 한 문장으로 요약.
              - details: 구체적인 분석 내용 3가지를 배열로 제공. (예: "읽기 전엔 '성장'을 원했지만 끝난 후엔 '평온'을 얻음")
            4. character:
              - name: 음식 이름 (예: "달콤쌉싸름한 다크 초콜릿", "몽글몽글 순두부")
              - traits: 캐릭터의 특징 키워드 3개.
              - description: 캐릭터에 대한 짧은 묘사.
              - reason: 이 캐릭터로 선정된 심리적 근거 (사용자의 데이터 기반).
            5. statistics:
              - totalBooks: 입력받은 책의 총 개수.
              - mostFrequentEmotion: 가장 많이 선택된 감정.
              - changeSummary: 지난달 대비 혹은 이달 내에서의 심리 변화 요약.
            6. coachMessage: 다음 달의 독서를 응원하는 다정하고 따뜻한 격려 한마디.

            {
              "reportTitle": string,
              "topIntent": {
                "label": string,
                "count": number,
                "insight": string
              },
              "intentVsEmotionAnalysis": {
                "summary": string,
                "details": string[]
              },
              "character": {
                "name": string,
                "traits": string[],
                "description": string,
                "reason": string
              },
              "statistics": {
                "totalBooks": number,
                "mostFrequentEmotion": string,
                "changeSummary": string
              },
              "coachMessage": string
            }

            [작성 규칙]
            - 모든 문장은 자연스럽고 따뜻한 한국어로 작성하세요.
            - 과장하지 말고, 실제 데이터를 기반으로 해석하세요.
            - "details"는 2~3개의 문장 배열로 작성하세요.
            - "traits"는 2~3개 작성하세요.
            `,
        generationConfig: noThinking({
          temperature: 0.7,
          responseMimeType: 'application/json',
        }),
      });

      const result = await model.generateContent(`
              [현재 사용자가 저장한 책]: ${JSON.stringify(myBooks)}
            `);

      const raw = result.response.text();
      if (!raw) throw new Error('No content returned from Gemini');

      const parsed = JSON.parse(raw) as AIBookReportDto;

      return {
        reportTitle: parsed.reportTitle || '이달의 독서 기록',
        topIntent: {
          label: parsed.topIntent?.label || '미정',
          count: parsed.topIntent?.count || 0,
          insight: parsed.topIntent?.insight || '독서 의도를 분석 중입니다.',
        },
        intentVsEmotionAnalysis: {
          summary:
            parsed.intentVsEmotionAnalysis?.summary ||
            '의도와 감정을 분석 중입니다.',
          details: Array.isArray(parsed.intentVsEmotionAnalysis?.details)
            ? parsed.intentVsEmotionAnalysis.details
            : [],
        },
        character: {
          name: parsed.character?.name || '',
          traits: Array.isArray(parsed.character?.traits)
            ? parsed.character.traits
            : [],
          description: parsed.character?.description || '',
          reason: parsed.character?.reason || '',
        },
        statistics: {
          totalBooks: parsed.statistics?.totalBooks || 0,
          mostFrequentEmotion: parsed.statistics?.mostFrequentEmotion || '없음',
          changeSummary:
            parsed.statistics?.changeSummary || '변화를 분석 중입니다.',
        },
        coachMessage: parsed.coachMessage || '다음 달에도 즐거운 독서 되세요!',
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('[AI Report Generation Error]', errorMessage);

      return {
        reportTitle: '리포트를 생성할 수 없습니다.',
        topIntent: { label: '', count: 0, insight: '' },
        intentVsEmotionAnalysis: {
          summary: '오류가 발생했습니다.',
          details: [],
        },
        character: {
          name: '알 수 없음',
          traits: [],
          description: '',
          reason: '',
        },
        statistics: {
          totalBooks: 0,
          mostFrequentEmotion: '',
          changeSummary: '',
        },
        coachMessage: '잠시 후 다시 시도해 주세요.',
      };
    }
  }
}
