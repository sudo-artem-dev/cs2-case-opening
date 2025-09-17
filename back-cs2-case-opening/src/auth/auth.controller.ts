import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { pseudo: string; password: string }) {
    if (!body.pseudo || !body.password) {
      throw new UnauthorizedException('Pseudo et mot de passe requis');
    }

    return this.authService.login(body.pseudo, body.password);
  }
}
