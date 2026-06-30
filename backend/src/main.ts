import * as dns from 'node:dns';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  // MongoDB Atlas `mongodb+srv://` URIs need a DNS SRV lookup. If the machine's
  // default resolver refuses SRV queries (querySrv ECONNREFUSED — common behind
  // a VPN/corporate DNS, even when Compass works via the OS resolver), point
  // Node at a resolver that answers SRV by setting DNS_SERVERS, e.g.
  //   DNS_SERVERS=8.8.8.8,1.1.1.1
  // Must run before any DNS lookup (i.e. before the Mongoose connection).
  const dnsServers = process.env.DNS_SERVERS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (dnsServers?.length) {
    dns.setServers(dnsServers);
    // eslint-disable-next-line no-console
    console.log(`Using custom DNS servers: ${dnsServers.join(', ')}`);
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  // All routes live under /api.
  app.setGlobalPrefix('api');

  // Secure HTTP headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.).
  // crossOriginResourcePolicy is relaxed so the Next.js storefront on another
  // origin can still load product images served from /uploads.
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

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
