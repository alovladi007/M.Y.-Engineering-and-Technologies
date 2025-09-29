import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];
  
  // Add Replit domain if available
  if (process.env.REPLIT_DEV_DOMAIN) {
    allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
  }
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('PowerFlow API')
    .setDescription('PowerFlow API Gateway')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Set global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`🚀 API Gateway running on http://localhost:${port}`);
  console.log(`📚 API Documentation available at http://localhost:${port}/api/docs`);
}
bootstrap();