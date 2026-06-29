import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // All routes live under /api.
  app.setGlobalPrefix('api');

  // Allow the Next.js storefront to call us during development.
  app.enableCors({
    origin: config.get<string>('CLIENT_URL') ?? 'http://localhost:3000',
    credentials: true,
  });

  // Validate + transform every DTO; strip unknown properties and reject extras.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Canonical error envelope, no stack traces leaked.
  app.useGlobalFilters(new AllExceptionsFilter());

  // Serve uploaded product images statically from /uploads.
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads/' });

  // Swagger UI at /api/docs.
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MARL API')
    .setDescription('Mini e-commerce platform — storefront + admin.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('PORT') ?? 8000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`MARL API listening on http://localhost:${port}/api (docs: /api/docs)`);
}
void bootstrap();
