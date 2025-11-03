import {
  BadRequestException,
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CasesService } from './cases.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/roles.decorator';

@Controller('cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get('ping')
  async ping() {
    return { status: 'ok' };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll() {
    return this.casesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Post(':id/open')
  @UseGuards(JwtAuthGuard)
  async openCase(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.sub; // injecté par JwtAuthGuard
    return this.casesService.openCase(id, userId);
  }
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role('admin')
  async updateProbabilities(
    @Param('id') id: string,
    @Body('rarityProbabilities')
    rarityProbabilities: { rarity: string; probability: number }[],
  ) {
    try {
      if (!rarityProbabilities || rarityProbabilities.length === 0) {
        throw new BadRequestException(
          'Paramètres manquants (rarityProbabilities).',
        );
      }

      return await this.casesService.updateProbabilities(
        id,
        rarityProbabilities,
      );
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof BadRequestException
      ) {
        throw err;
      }

      throw new InternalServerErrorException('Erreur serveur.');
    }
  }
  @Post(':id/sync')
  @UseGuards(JwtAuthGuard)
  async syncOfflineSkin(
    @Param('id') caseId: string,
    @Body()
    body: {
      userId: string;
      skinId: string;
      name: string;
      rarity: string;
      imageUrl: string;
      cost?: number;
    },
  ) {
    return this.casesService.syncOfflineSkin(caseId, body);
  }
}
