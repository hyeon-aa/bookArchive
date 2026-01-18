import { Injectable } from '@nestjs/common';
import Groq from 'groq-sdk'; // npm install groq-sdk
import { AITagRequestDto } from './ai-request.dto';
import { AITagResponseDto } from './ai-response.dto';

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
        // 🔥 핵심: JSON 모드를 활성화합니다.
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const rawContent = chatCompletion.choices[0]?.message?.content;

      if (!rawContent) {
        throw new Error('No content returned from Groq');
      }

      console.log('[Groq RAW]', rawContent);

      // JSON 모드이므로 extractJSON 함수 없이 바로 파싱 가능합니다.
      const parsed: unknown = JSON.parse(rawContent);

      // 타입 가드 (기존 로직 유지)
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
}
