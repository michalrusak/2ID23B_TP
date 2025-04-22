import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Post } from '../entities/blog.entity';
import { sanitizeInput } from 'src/utils/sanitaze';

@Injectable()
export class BlogService {
  constructor(private dataSource: DataSource) {
    this.initializePosts().catch((error) => {
      console.error('Failed to initialize posts table:', error);
      // Don't rethrow, just log internally
    });
  }

  async createPost(title: string, content: string, author: string) {
    try {
      const sanitizedTitle = sanitizeInput(title);
      const sanitizedContent = sanitizeInput(content);
      const sanitizedAuthor = sanitizeInput(author);

      return await this.dataSource.query(
        `INSERT INTO posts (title, content, author) VALUES ($1, $2, $3) RETURNING id`,
        [sanitizedTitle, sanitizedContent, sanitizedAuthor],
      );
    } catch (error) {
      console.error('Error creating post:', error);
      throw new InternalServerErrorException('Unable to create post');
    }
  }

  async getAllPosts() {
    try {
      return await this.dataSource.getRepository(Post).find();
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw new InternalServerErrorException('Unable to fetch posts');
    }
  }

  async getPostById(id: number) {
    try {
      const post = await this.dataSource.getRepository(Post).findOneBy({ id });
      if (!post) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }
      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Rethrow NotFoundException
      }
      console.error(`Error fetching post with id ${id}:`, error);
      throw new InternalServerErrorException('Unable to fetch post');
    }
  }

  async updatePost(id: number, title: string, content: string) {
    try {
      const sanitizedTitle = sanitizeInput(title);
      const sanitizedContent = sanitizeInput(content);

      const result = await this.dataSource.query(
        `UPDATE posts SET title = $1, content = $2 WHERE id = $3 RETURNING id`,
        [sanitizedTitle, sanitizedContent, id],
      );

      if (!result || result.length === 0) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Rethrow NotFoundException
      }
      console.error(`Error updating post with id ${id}:`, error);
      throw new InternalServerErrorException('Unable to update post');
    }
  }

  async deletePost(id: number) {
    try {
      const result = await this.dataSource.query(
        `DELETE FROM posts WHERE id = $1 RETURNING id`,
        [id],
      );

      if (!result || result.length === 0) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Rethrow NotFoundException
      }
      console.error(`Error deleting post with id ${id}:`, error);
      throw new InternalServerErrorException('Unable to delete post');
    }
  }

  async initializePosts() {
    try {
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
    } catch (error) {
      console.error('Error initializing posts table:', error);
      // Don't throw here to avoid disrupting application startup
    }
  }
}
