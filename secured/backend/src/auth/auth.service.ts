import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { sanitizeInput } from 'src/utils/sanitaze';
import { DataSource } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(private dataSource: DataSource) {
    this.initializeAdmin();
    this.scheduleTokenCleanup();
  }

  private scheduleTokenCleanup() {
    // Run cleanup every hour
    setInterval(() => this.cleanupExpiredTokens(), 60 * 60 * 1000);
  }

  private async cleanupExpiredTokens() {
    try {
      await this.dataSource.query(
        `DELETE FROM token_blacklist WHERE expires_at < NOW()`,
      );
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `SELECT COUNT(*) FROM token_blacklist WHERE token = $1 AND expires_at > NOW()`,
      [token],
    );
    return parseInt(result[0].count) > 0;
  }

  async register(username: string, password: string) {
    if (username.length < 3 || password.length < 3) {
      throw new BadRequestException(
        'Username and password must be at least 3 characters long',
      );
    }

    try {
      console.log('Registering user:', username);
      const sanitizedUsername = sanitizeInput(username);

      const hashedPassword = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');

      const role = 'user';

      await this.dataSource.query(
        `INSERT INTO users (username, password, role, failed_attempts, locked_until) VALUES ($1, $2, $3, $4, $5)`,
        [sanitizedUsername, hashedPassword, role, 0, null],
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
    if (username.length < 3 || password.length < 3) {
      throw new BadRequestException(
        'Username and password must be at least 3 characters long',
      );
    }

    try {
      const sanitizedUsername = sanitizeInput(username);

      const hashedPassword = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');

      const result = await this.dataSource.query(
        `SELECT * FROM users WHERE username = $1`,
        [sanitizedUsername],
      );

      if (result.length === 0) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const user = result[0];

      // Check if the account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        throw new UnauthorizedException(
          `Account is locked until ${user.locked_until}`,
        );
      }

      if (user.password !== hashedPassword) {
        // Increment failed attempts
        const failedAttempts = user.failed_attempts + 1;
        const lockThreshold = 5; // Number of failed attempts before locking
        const lockDuration = 15 * 60 * 1000; // Lock duration in milliseconds (15 minutes)

        let lockedUntil = null;
        if (failedAttempts >= lockThreshold) {
          lockedUntil = new Date(Date.now() + lockDuration);
        }

        await this.dataSource.query(
          `UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE username = $3`,
          [failedAttempts, lockedUntil, sanitizedUsername],
        );

        if (lockedUntil) {
          throw new UnauthorizedException(
            `Too many failed attempts. Account is locked until ${lockedUntil}`,
          );
        }

        throw new UnauthorizedException('Invalid credentials');
      }

      // Reset failed attempts on successful login
      await this.dataSource.query(
        `UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE username = $1`,
        [sanitizedUsername],
      );

      const token = jwt.sign(
        { username: sanitizedUsername, role: user.role },
        process.env.SECRET_KEY,
        {
          expiresIn: Number(process.env.EXPIRE_TIME),
        },
      );

      const isAdmin = user.role === 'admin';
      return { token, isAdmin, username: sanitizedUsername };
    } catch (error) {
      console.error('Error logging in:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  async autoLogin(token: string) {
    try {
      if (!token) {
        throw new BadRequestException('Token is missing');
      }

      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(token);
      if (isBlacklisted) {
        throw new UnauthorizedException('Token has been invalidated');
      }

      const decoded: any = jwt.verify(token, process.env.SECRET_KEY);
      const result = await this.dataSource.query(
        `SELECT * FROM users WHERE username = $1`,
        [decoded.username],
      );

      if (result.length === 0) {
        throw new UnauthorizedException('User not found');
      }

      const user = result[0];
      return { username: user.username, isAdmin: user.role === 'admin' };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(`Invalid token: ${error.message}`);
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException('Auto login failed');
    }
  }

  async logout(token: string, expiresAt: Date) {
    try {
      await this.dataSource.query(
        `INSERT INTO token_blacklist (token, expires_at) VALUES ($1, $2)`,
        [token, expiresAt],
      );

      return { message: 'Logged out successfully' };
    } catch (error) {
      console.error('Error logging out:', error);
      throw new InternalServerErrorException('Logout failed');
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
            failed_attempts INT DEFAULT 0,
            locked_until TIMESTAMP,
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
