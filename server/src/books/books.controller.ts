import { Controller, Get, Query } from '@nestjs/common';
import { BooksService } from './books.service';
import { SearchQueryDto } from './dto/booksearch-dto';

@Controller('books')
export class BooksController {
  constructor(private readonly service: BooksService) {}

  @Get('search')
  search(@Query() query: SearchQueryDto) {
    return this.service.search(query.query);
  }
}
