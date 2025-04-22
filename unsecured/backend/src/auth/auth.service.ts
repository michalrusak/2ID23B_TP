import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(private dataSource: DataSource) {
    this.initializeAdmin();
  }

  async register(username: string, password: string) {
    try {
      const hashedPassword = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');

      const role = 'user';

      await this.dataSource.query(
        `INSERT INTO users (username, password, role) VALUES ($1, $2, $3)`,
        [username, hashedPassword, role],
      );

      return { message: 'User registered successfully' };
    } catch (error) {
      console.error('Error registering user:', error);
      if (error.code === '23505') {
        throw new BadRequestException('Username already exists');
      }
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(username: string, password: string) {
    try {
      const hashedPassword = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');

      const result = await this.dataSource.query(
        `SELECT * FROM users WHERE username = $1 AND password = $2`,
        [username, hashedPassword],
      );

      if (result.length === 0) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const user = result[0];
      const token = jwt.sign(
        { username, role: user.role },
        process.env.SECRET_KEY,
        {
          expiresIn: process.env.EXPIRE_TIME,
        },
      );

      const isAdmin = user.role === 'admin';
      return { token, isAdmin, username };
    } catch (error) {
      console.error('Error logging in:', error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException({
        message: 'Login failed',
        error: error.message,
        stack: error.stack,
      });
    }
  }

  async autoLogin(token: string) {
    try {
      if (!token) {
        throw new BadRequestException('Token is missing');
      }

      const decoded: any = jwt.verify(token, process.env.SECRET_KEY);
      console.log('Decoded token:', decoded);

      const result = await this.dataSource.query(
        `SELECT * FROM users WHERE username = '${decoded.username}'`,
      );

      if (result.length === 0) {
        throw new UnauthorizedException('User not found');
      }

      const user = result[0];
      return { username: user.username, isAdmin: user.role === 'admin' };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(`Invalid token: ${error}`);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Auto login failed');
    }
  }

  async initializeAdmin() {
    try {
      const tableCheck = await this.dataSource.query(
        `SELECT to_regclass('public.users') AS table_exists;`,
      );

      if (!tableCheck[0].table_exists) {
        await this.dataSource.query(
          `CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );`,
        );
        console.log('Tabela users została utworzona.');
      } else {
        console.log('Tabela users już istnieje.');
      }

      const result = await this.dataSource.query(
        `SELECT * FROM users WHERE username = 'admin'`,
      );

      if (result.length === 0) {
        const hashedPassword = crypto
          .createHash('sha256')
          .update('admin')
          .digest('hex');

        await this.dataSource.query(
          `INSERT INTO users (username, password, role) VALUES ('admin', '${hashedPassword}', 'admin')`,
        );
        console.log('Użytkownik admin został utworzony.');
      } else {
        console.log('Użytkownik admin już istnieje.');
      }
    } catch (error) {
      console.error('Error initializing admin:', error);
      throw new InternalServerErrorException('Failed to initialize admin user');
    }
  }
}
