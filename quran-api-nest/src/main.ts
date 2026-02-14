import 'reflect-metadata';
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swaggerPath = (process.env.SWAGGER_PATH ?? 'swagger').replace(/^\/+|\/+$/g, '');

  app.enableCors({
    origin: true,
    methods: '*',
    allowedHeaders: '*',
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/' && swaggerPath) return res.redirect(`/${swaggerPath}`);
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Quran Read API')
    .setDescription('Quran read API for UI (NestJS port).')
    .setVersion('v1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
}

bootstrap();
