import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // accepte tous les origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*', // ou ["Content-Type", "Authorization", ...]
  });

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  await app.listen(process.env.API_PORT ?? 3000, '0.0.0.0');
}
bootstrap();
