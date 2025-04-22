import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Post } from '../entities/blog.entity';
import { sanitizeInput } from 'src/utils/sanitaze';

@Injectable()
export class BlogService {
  constructor(private dataSource: DataSource) {
    this.initializePosts();
  }

  async createPost(title: string, content: string, author: string) {
    const sanitizedTitle = sanitizeInput(title);
    const sanitizedContent = sanitizeInput(content);
    const sanitizedAuthor = sanitizeInput(author);

    return this.dataSource.query(
      `INSERT INTO posts (title, content, author) VALUES ($1, $2, $3)`,
      [sanitizedTitle, sanitizedContent, sanitizedAuthor],
    );
  }

  async getAllPosts() {
    return this.dataSource.getRepository(Post).find();
  }

  async getPostById(id: number) {
    return this.dataSource.getRepository(Post).findOneBy({ id });
  }

  async updatePost(id: number, title: string, content: string) {
    return this.dataSource.query(
      `UPDATE posts SET title = $1, content = $2 WHERE id = $3`,
      [title, content, id],
    );
  }

  async deletePost(id: number) {
    return this.dataSource.query(`DELETE FROM posts WHERE id = $1`, [id]);
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
