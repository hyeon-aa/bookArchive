import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- Swagger 설정 시작 ---
  const config = new DocumentBuilder()
    .setTitle('bookArchive API Docs')
    .setDescription('NestJS API 명세서입니다.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 1. CORS 설정 추가: 프론트엔드(3000)에서 오는 요청을 허용합니다.
  app.enableCors({
    origin: ['http://localhost:3000', 'https://book-archive-mocha.vercel.app'],
    credentials: true,
  });

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 필드 자동 제거
      forbidNonWhitelisted: true, // 허용 안 된 필드 오면 400 에러
      transform: true, // 타입 자동 변환 (string → number 등)
    }),
  );

  // 2. Render 등 배포 환경은 자체 PORT를 주입하므로 그걸 우선 쓰고,
  // 없으면(로컬 개발) 4000으로 폴백한다.
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  await app.listen(port);
}
bootstrap();
