import { InternalServerErrorException, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from 'src/entities/blog.entity';
import { User } from 'src/entities/user.entity';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'blogdb',
      entities: [User, Post],
      synchronize: false,
    }),
  ],
})
export class DatabaseModule {
  constructor(private dataSource: DataSource) {
    this.initializeTokenBlacklist();
  }

  private async initializeTokenBlacklist() {
    try {
      const tableCheck = await this.dataSource.query(
        `SELECT to_regclass('public.token_blacklist') AS table_exists;`,
      );

      if (!tableCheck[0].table_exists) {
        await this.dataSource.query(`
          CREATE TABLE token_blacklist (
            id SERIAL PRIMARY KEY,
            token TEXT NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('Tabela token_blacklist została utworzona.');
        // Create an index on expires_at for faster cleanup
        await this.dataSource.query(`
          CREATE INDEX idx_token_blacklist_expires_at ON token_blacklist(expires_at);
        `);
      }
    } catch {
      console.error('Error initializing token blacklist');
      throw new InternalServerErrorException(
        'Failed to initialize token blacklist',
      );
    }
  }
}
