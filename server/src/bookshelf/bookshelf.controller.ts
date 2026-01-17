import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth-guard';
import { BookshelfService } from './bookshelf.service';
import { AddBookDto } from './dto/add-book.dto';

interface AuthRequest extends Request {
  user: {
    userId: number;
  };
}

@Controller('bookshelf')
@UseGuards(JwtAuthGuard) //
export class BookshelfController {
  constructor(private readonly service: BookshelfService) {}

  @Post()
  add(@Req() req: AuthRequest, @Body() dto: AddBookDto) {
    return this.service.addBook(req.user.userId, dto);
  }

  @Get()
  getMyBooks(@Req() req: AuthRequest) {
    return this.service.getMyBooks(req.user.userId);
  }
}
