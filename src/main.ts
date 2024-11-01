import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PostStatusInterceptor } from './common/interceptor/post-status.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-exception.filter';
import { ConfigService } from '@nestjs/config';
import * as expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.enableCors({
    credentials: true,
    origin: ['https://sluurp.io', 'http://localhost:3001'],
  });

  app.useGlobalInterceptors(new PostStatusInterceptor());
  app.useGlobalFilters(
    new HttpExceptionFilter(),
    new PrismaClientExceptionFilter(),
  );

  const documentBuilder = new DocumentBuilder()
    .setTitle('Slurp API')
    .setDescription('The Slurp API description')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'accessToken',
    )
    .addBasicAuth(
      {
        type: 'http',
        scheme: 'basic',
      },
      'worker',
    )
    .build();

  const userName = configService.get('SWAGGER_USERNAME');
  const password = configService.get('SWAGGER_PASSWORD');

  app.use(
    ['/api', '/api-json'],
    expressBasicAuth({
      challenge: true,
      users: { [userName]: password },
    }),
  );

  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
