import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { SkinsService } from './skins.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('skins')
export class SkinsController {
  constructor(private readonly skinsService: SkinsService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.skinsService.findOne(id);
  }
}
