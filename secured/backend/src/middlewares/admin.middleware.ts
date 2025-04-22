import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { Response } from 'express';

@Injectable()
export class AdminMiddleware implements NestMiddleware {
  async use(req, res: Response, next: NextFunction) {
    if (req.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }
    next();
  }
}
