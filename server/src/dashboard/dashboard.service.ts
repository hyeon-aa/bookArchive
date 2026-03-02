import { Injectable } from '@nestjs/common';
import { BookStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

type DashboardBook = Prisma.BookshelfGetPayload<{
  select: {
    status: true;
    endDate: true;
    emotion: true;
  };
}>;

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: number): Promise<DashboardResponseDto> {
    const books: DashboardBook[] = await this.prisma.bookshelf.findMany({
      where: { userId },
      select: {
        status: true,
        endDate: true,
        emotion: true,
      },
    });

    const totalCount = books.length;
    const doneCount = books.filter((b) => b.status === BookStatus.DONE).length;

    const readingCount = books.filter(
      (b) => b.status === BookStatus.READING,
    ).length;

    const completionRate =
      totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

    const monthlyStats = this.calculateMonthlyStats(books);
    const emotionStats = this.calculateEmotionStats(books);

    return {
      totalCount,
      doneCount,
      readingCount,
      completionRate,
      monthlyStats,
      emotionStats,
    };
  }

  private calculateMonthlyStats(books: DashboardBook[]) {
    const monthlyMap: Record<string, number> = {};

    books
      .filter((b) => b.status === BookStatus.DONE && b.endDate !== null)
      .forEach((book) => {
        const month = book.endDate!.toISOString().slice(0, 7);

        monthlyMap[month] = (monthlyMap[month] || 0) + 1;
      });

    return Object.entries(monthlyMap)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  private calculateEmotionStats(books: DashboardBook[]) {
    const emotionMap: Record<string, number> = {};

    books
      .filter((b) => b.emotion !== null)
      .forEach((book) => {
        const emotion = book.emotion!;
        emotionMap[emotion] = (emotionMap[emotion] || 0) + 1;
      });

    return Object.entries(emotionMap)
      .map(([emotion, count]) => ({ emotion, count }))
      .sort((a, b) => b.count - a.count);
  }
}
