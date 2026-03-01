import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmbeddingService {
  private genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

  async createEmbedding(text: string): Promise<number[]> {
    const model = this.genAI.getGenerativeModel({
      model: 'models/gemini-embedding-001',
    });

    const result = await model.embedContent(text);
    return result.embedding.values;
  }
}
