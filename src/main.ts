import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from '@fastify/helmet';
import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import fastifyCors from '@fastify/cors';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({
    trustProxy: true,
    bodyLimit: 1 * 1024 * 1024,
  }));
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe());
  await app.register(helmet);
  await app.register(fastifyCors, {
    origin: 'http://localhost:4200',
    credentials: true,
    methods: '*',
    optionsSuccessStatus: 204,
    preflightContinue: false,
  })

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
