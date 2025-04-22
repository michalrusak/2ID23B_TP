import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('posts')
export class BlogController {
  constructor(private blogService: BlogService) {}

  @Post()
  createPost(@Req() req, @Body() body: any) {
    const author = req.user.username;
    return this.blogService.createPost(body.title, body.content, author);
  }

  @Get()
  getAllPosts() {
    return this.blogService.getAllPosts();
  }

  @Get(':id')
  getPostById(@Param('id') id: number) {
    return this.blogService.getPostById(id);
  }

  @Put(':id')
  updatePost(@Param('id') id: number, @Body() body: any) {
    return this.blogService.updatePost(id, body.title, body.content);
  }

  @Delete(':id')
  deletePost(@Param('id') id: number) {
    return this.blogService.deletePost(id);
  }
}
