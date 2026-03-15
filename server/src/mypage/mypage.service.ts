import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MyPhraseResponseDto } from './dto/myphrase-reponse.dto';
import { MyTagsResponseDto } from './dto/mytags-response.dto';

@Injectable()
export class MypageService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyPhrase(userId: number): Promise<MyPhraseResponseDto[]> {
    const records = await this.prisma.bookshelf.findMany({
      where: {
        userId,
        phrase: {
          not: null,
        },
      },
      // join = include
      include: {
        book: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            author: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return records.map((record) => ({
      id: record.id,
      phrase: record.phrase!,
      comment: record.comment ?? '',
      emotion: record.emotion ?? '',
      status: record.status,
      createdAt: record.createdAt,
      book: {
        id: record.book.id,
        title: record.book.title,
        imageUrl: record.book.imageUrl,
        author: record.book.author,
      },
    }));
  }

  async getMyTags(userId: number): Promise<MyTagsResponseDto> {
    const records = await this.prisma.bookshelf.findMany({
      where: {
        userId,
        //리스트에서는 isEmpty 사용
        aiTags: {
          isEmpty: false,
        },
      },
      select: { aiTags: true },
    });

    //[{ aiTags: ['A', 'B'] }, { aiTags: ['C'] }] -> ['A', 'B', 'C']
    const allTags = records.flatMap((record) => record.aiTags);

    const tagMap = allTags.reduce(
      (acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const tags = Object.entries(tagMap).map(([name, count]) => ({
      name,
      count,
    }));

    return { tags };
  }
}
