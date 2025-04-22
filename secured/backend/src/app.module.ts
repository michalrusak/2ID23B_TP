import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { BlogModule } from './blog/blog.module';
import { AdminModule } from './admin/admin.module';
import * as cookieParser from 'cookie-parser';

@Module({
  imports: [DatabaseModule, AuthModule, BlogModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieParser()).forRoutes('*');
  }
}
