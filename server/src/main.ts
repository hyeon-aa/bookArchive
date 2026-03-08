import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. CORS 설정 추가: 프론트엔드(3000)에서 오는 요청을 허용합니다.
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalInterceptors(new TransformInterceptor());

  // 2. 포트를 4000으로 고정합니다.
  const port = 4000;
  await app.listen(port);
}
bootstrap();
