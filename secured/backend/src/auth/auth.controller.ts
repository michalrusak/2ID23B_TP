import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body.username, body.password);
  }

  @Post('login')
  async login(@Body() body: any, @Req() req, @Res() res: Response) {
    const { token, isAdmin, username } = await this.authService.login(
      body.username,
      body.password,
    );
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: Number(process.env.EXPIRE_TIME),
    });
    return res.status(HttpStatus.OK).json({ isAdmin, username });
  }

  @Get('auto-login')
  async autoLogin(@Req() req: any) {
    const token = req.token;
    return this.authService.autoLogin(token);
  }

  @Get('logout')
  async logout(@Req() req: any, @Res() res: Response) {
    const token = req.token;
    const expiresAt = req.expiredDate;

    if (!token) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Token not provided' });
    }

    await this.authService.logout(token, expiresAt);

    res.clearCookie('token');
    return res
      .status(HttpStatus.OK)
      .json({ message: 'User logout successfully' });
  }
}

// console.log('expiresAt', expiresAt.toLocaleString());
// console.log('Current Time (UTC):', new Date().toLocaleString());
