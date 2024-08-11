import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',

    methods: ['PUT', 'GET', 'PATCH', 'DELETE'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically remove properties that are not in the DTO
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are found
      transform: true, // Automatically transform payloads to DTO instances
    }),
  );

  await app.listen(3000);
}
bootstrap();
