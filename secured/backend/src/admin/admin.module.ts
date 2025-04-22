import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

@Module({
  controllers: [AdminController],
  providers: [AdminService],
  imports: [TypeOrmModule.forFeature([User])],
})
export class AdminModule {}
