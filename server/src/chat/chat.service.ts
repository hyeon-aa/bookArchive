import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { aiService } from 'src/ai/ai.service';

@Injectable()
export class ChatService {
  constructor(private readonly aiService: aiService) {}

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
