import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UserInfoDto } from './dto/user-info.dto';
import { JwtAuthGuard } from './jwt-auth-guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('signup')
  @UsePipes(new ValidationPipe())
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.service.signUp(createUserDto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe())
  async login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponseDto> {
    return await this.service.login(loginUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@CurrentUser('userId') userId: number): Promise<UserInfoDto> {
    return await this.service.getMe(userId);
  }
}
