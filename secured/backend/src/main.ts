import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import helmet from 'helmet';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet.hidePoweredBy());

  app.enableCors({
    origin: [
      'http://192.168.137.1:4201',
      'http://localhost:4201',
      'http://localhost:4200',
    ],
    methods: 'GET,PUT,POST,DELETE, PATCH',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true,
  });
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
