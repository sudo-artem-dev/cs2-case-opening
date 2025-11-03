import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:8082', // pour le web en local
      'http://10.8.251.209:8082', // Expo depuis ton réseau local
    ],
    credentials: true,
  });

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen(process.env.API_PORT ?? 3000, '0.0.0.0');
}
bootstrap();
