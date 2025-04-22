import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Post } from '../entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(private dataSource: DataSource) {
    this.initializePosts();
  }

  async createPost(title: string, content: string, author: string) {
    try {
      return await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('posts')
        .values({ title, content, author })
        .execute();
    } catch (error) {
      console.error('Error creating post:', error);
      throw new InternalServerErrorException('Failed to create post');
    }
  }

  async getAllPosts() {
    try {
      return await this.dataSource.getRepository(Post).find();
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new InternalServerErrorException('Failed to fetch posts');
    }
  }

  async getPostById(id: number) {
    try {
      const post = await this.dataSource.getRepository(Post).findOneBy({ id });
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      return post;
    } catch (error) {
      console.error(`Error fetching post with id ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch post');
    }
  }

  async updatePost(id: number, title: string, content: string) {
    try {
      const result = await this.dataSource
        .createQueryBuilder()
        .update('posts')
        .set({ title, content })
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException('Post not found');
      }
      return result;
    } catch (error) {
      console.error(`Error updating post with id ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update post');
    }
  }

  async deletePost(id: number) {
    try {
      const result = await this.dataSource
        .createQueryBuilder()
        .delete()
        .from('posts')
        .where('id = :id', { id })
        .execute();

      if (result.affected === 0) {
        throw new NotFoundException('Post not found');
      }
      return result;
    } catch (error) {
      console.error(`Error deleting post with id ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete post');
    }
  }

  async initializePosts() {
    const tableCheck = await this.dataSource.query(
      `SELECT to_regclass('public.posts') AS table_exists;`,
    );

    if (!tableCheck[0].table_exists) {
      await this.dataSource.query(
        `CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255),
          content TEXT,
          author VARCHAR(255),
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,
      );
      console.log('Tabela posts została utworzona.');
    } else {
      console.log('Tabela posts już istnieje.');
    }
  }
}
