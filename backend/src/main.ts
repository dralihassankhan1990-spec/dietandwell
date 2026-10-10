import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Set global API prefix
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  // Serve static files from public directory
  const express = require('express');
  app.use('/uploads', express.static('public/uploads'));


  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('DietAndWell API')
    .setDescription('Nutrition portal API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Bind to 0.0.0.0 on configured port
  const port = process.env.PORT || 5000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 DietAndWell API is running on http://0.0.0.0:${port}`);
  console.log(`📚 API Documentation available at http://0.0.0.0:${port}/api/docs`);
}
bootstrap();
