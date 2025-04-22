import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req, res: Response, next: NextFunction) {
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded: any = await jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        req.token = token;
        req.role = decoded.role;
        req.expiredDate = new Date(decoded.exp * 1000);

        next();
      } catch {
        res.status(401).json({ message: 'Invalid token' });
      }
    } else {
      res.status(401).json({ message: 'Token not provided!' });
    }
  }
}
