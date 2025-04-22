import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { BlogController } from './blog.controller';
import { BlogService } from './blog.service';
import { AuthMiddleware } from 'src/middlewares/auth.middleware';

@Module({
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: `/posts`, method: RequestMethod.ALL });
  }
}
