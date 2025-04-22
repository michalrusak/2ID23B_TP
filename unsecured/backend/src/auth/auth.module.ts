import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseModule } from 'src/database/database.module';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [DatabaseModule],
})
export class AuthModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '/auth/auto-login', method: RequestMethod.ALL });
  }
}
