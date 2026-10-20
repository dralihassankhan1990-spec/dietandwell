import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'path';
import { AppModule } from './app.module';
import { httpProtection } from './common/http-protection';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  if (process.env.TRUST_PROXY_HOPS) app.getHttpAdapter().getInstance().set('trust proxy', Number(process.env.TRUST_PROXY_HOPS));
  app.use(httpProtection());

  // CORS allowlist. FRONTEND_URL may hold a single origin or a
  // comma-separated list. The production domains are always allowed.
  // Requests without an Origin header (curl, server-to-server) are allowed.
  const allowedOrigins = Array.from(
    new Set(
      [
        ...(process.env.FRONTEND_URL
          ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
          : []),
        'http://localhost:3100',
        // Keep the default Vite origins available for alternate local runs.
        'http://localhost:5173',
        'http://localhost:4173', // plain `vite preview` default port
        'https://dietandwell.com',
        'https://www.dietandwell.com',
      ].filter(Boolean),
    ),
  );
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const isDevelopment = process.env.NODE_ENV !== 'production';
      const isLocalDevelopmentOrigin =
        isDevelopment &&
        !!origin &&
        /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);
      if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin) {
        callback(null, true);
      } else {
        // Deny quietly (no CORS headers) rather than throwing — a thrown
        // error becomes a 500, which misrepresents a plain CORS denial.
        callback(null, false);
      }
    },
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Serve static files from backend/public/uploads (dev local storage).
  // __dirname is src/ under ts-node and dist/ after build — both resolve
  // to backend/public/uploads.
  app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

  // Swagger API documentation. Verified live: the global 'api' prefix is
  // NOT prepended to the setup path, so 'api/docs' serves at /api/docs.
  const config = new DocumentBuilder()
    .setTitle('DietAndWell API')
    .setDescription('Nutrition portal API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_API_DOCS === 'true') {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Bind to 0.0.0.0 on configured port
  const port = process.env.PORT || 8000;
  await app.listen(port, '0.0.0.0');
  logger.log(`DietAndWell API is running on http://0.0.0.0:${port}`);
  logger.log(`API Documentation available at http://0.0.0.0:${port}/api/docs`);
}
bootstrap();
