import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(pseudo: string, password: string) {
    try {
      const user = await this.usersService.findByPseudo(pseudo);
      if (!user) throw new UnauthorizedException('Identifiants invalides');

      const passwordValid = await bcrypt.compare(password, user.password);
      if (!passwordValid)
        throw new UnauthorizedException('Identifiants invalides');

      return user;
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new InternalServerErrorException('Erreur serveur');
    }
  }

  async login(pseudo: string, password: string) {
    const user = await this.validateUser(pseudo, password);

    const payload = {
      sub: user._id,
      pseudo: user.pseudo,
      role: user.role,
    };

    return {
      _id: user._id,
      pseudo: user.pseudo,
      role: user.role,
      token: this.jwtService.sign(payload),
    };
  }
}
