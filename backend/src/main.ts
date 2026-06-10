import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const frontendUrl = configService.get<string>('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl ? frontendUrl.split(',').map((url) => url.trim()) : '*',
  });

  const port = configService.get<number>('PORT') ?? 4000;
  await app.listen(port);
}
void bootstrap();
