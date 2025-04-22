import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    try {
      const decoded: any = await jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded;
      req.token = token;
      req.role = decoded.role;

      next();
    } catch (error) {
      // Log the error server-side for debugging but don't expose it to client
      console.error('Authentication error:', error);

      // Return a generic error message without exposing details
      res.status(401).json({ message: 'Authentication failed' });
    }
  }
}
