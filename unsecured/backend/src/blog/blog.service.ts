import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Post } from '../entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(private dataSource: DataSource) {
    this.initializePosts();
  }

  async createPost(title: string, content: string, author: string) {
    return this.dataSource.query(
      `INSERT INTO posts (title, content, author) VALUES ('${title}', '${content}', '${author}')`,
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
      `UPDATE posts SET title = '${title}', content = '${content}' WHERE id = ${id}`,
    );
  }

  async deletePost(id: number) {
    return this.dataSource.query(`DELETE FROM posts WHERE id = ${id}`);
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
