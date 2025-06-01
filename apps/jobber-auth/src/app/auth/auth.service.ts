import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginInput } from './dto/login.input';
import { Response } from 'express';
import { UsersService } from '../users/users.service';
import { compare } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './dto/token-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService
  ) {}
  async login({ email, password }: LoginInput, response: Response) {
    const user = await this.verifyUser(email, password);
    const expires = new Date();
    expires.setMilliseconds(
      expires.getTime() +
        parseInt(this.configService.getOrThrow('AUTH_JWT_EXPIRATION_MS'))
    );
    const tokenPayload: TokenPayload = {
      userId: user.id,
    };
    const access_token = this.jwtService.sign(tokenPayload);
    response.cookie('Authentication', access_token, {
      httpOnly: true,
      secure: this.configService.get('NODE_ENV') === 'production',
      expires,
    });
    return user;
  }

  private async verifyUser(email: string, password: string) {
    try {
      const user = await this.userService.getUser({
        email,
      });
      const authenticated = await compare(password, user.password);
      if (!authenticated) throw new UnauthorizedException();
      return user;
    } catch (error) {
      throw new UnauthorizedException('Credentials are not valid');
    }
  }
}
