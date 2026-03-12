import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { CurrentUser } from '../common/decorators/user.decorator'; // 데코레이터 임포트
import { BookshelfService } from './bookshelf.service';
import { AddBookDto } from './dto/add-book.dto';
import { DeleteBookshelfDto } from './dto/delete-bookshelf.dto';
import { UpdateBookshelfDto } from './dto/update-bookshelf.dto';

@Controller('bookshelf')
@UseGuards(JwtAuthGuard)
export class BookshelfController {
  constructor(private readonly service: BookshelfService) {}

  @Post()
  add(@CurrentUser('userId') userId: number, @Body() dto: AddBookDto) {
    return this.service.addBook(userId, dto);
  }

  @Get()
  getMyBooks(@CurrentUser('userId') userId: number) {
    return this.service.getMyBooks(userId);
  }

  @Get(':id')
  getBookshelfItem(
    @CurrentUser('userId') userId: number,
    @Param('id') id: string,
  ) {
    return this.service.getBookshelfItem(Number(id), userId);
  }

  @Patch(':id')
  update(
    @CurrentUser('userId') userId: number,
    @Param('id') id: string,
    @Body() dto: UpdateBookshelfDto,
  ) {
    return this.service.updateBookshelf(Number(id), userId, dto);
  }

  @Delete('batch')
  async deleteBooks(
    @CurrentUser('userId') userId: number,
    @Body() dto: DeleteBookshelfDto,
  ) {
    return await this.service.deleteBooks(userId, dto.bookshelfIds);
  }
}
