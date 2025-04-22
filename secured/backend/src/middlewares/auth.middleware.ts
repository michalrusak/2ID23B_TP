import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    try {
      const decoded: any = await jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded;
      req.token = token;
      req.role = decoded.role;

      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token', error });
    }
  }
}
