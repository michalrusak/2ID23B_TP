import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req, res: Response, next: NextFunction) {
    const old_token = req.headers['authorization'];
    const token = old_token.replace('Bearer ', '');
    if (token) {
      try {
        const decoded: any = await jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        req.token = token;
        req.role = decoded.role;

        next();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        res.status(401).json({ message: 'Invalid token', error });
      }
    } else {
      res.status(401).json({ message: 'Token not provided' });
    }
  }
}
