import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({
    trustProxy: true,
    bodyLimit: 1 * 1024 * 1024,
  }));

  await app.register(helmet);

  await app.register(fastifyCors, {
    origin: 'http://localhost:4200',
    credentials: true,
    methods: '*',
    optionsSuccessStatus: 204,
    preflightContinue: false,
  })

  app.setGlobalPrefix('/api/v1', {
    exclude: [{ path: '', method: RequestMethod.GET }],
  })

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();

