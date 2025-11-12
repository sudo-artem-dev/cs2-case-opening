import {
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/inventory')
  @UseGuards(JwtAuthGuard)
  async getInventory(@Param('id') id: string, @Query('since') since?: string) {
    return this.usersService.getUserInventory(id, since);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('admin')
  async findAll() {
    try {
      return await this.usersService.findAll();
    } catch {
      throw new InternalServerErrorException('Erreur serveur.');
    }
  }
}
