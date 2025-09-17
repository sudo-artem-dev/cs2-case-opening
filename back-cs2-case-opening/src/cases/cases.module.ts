import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CasesService } from './cases.service';
import { CasesController } from './cases.controller';
import { SkinsService } from './skins.service';
import { SkinsController } from './skins.controller';
import { Case, CaseSchema } from './schemas/case.schema';
import { Skin, SkinSchema } from './schemas/skin.schema';
import { Inventory, InventorySchema } from './schemas/inventory.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Case.name, schema: CaseSchema },
      { name: Skin.name, schema: SkinSchema },
      { name: Inventory.name, schema: InventorySchema },
    ]),
    AuthModule,
  ],
  controllers: [CasesController, SkinsController],
  providers: [CasesService, SkinsService],
})
export class CasesModule {}
