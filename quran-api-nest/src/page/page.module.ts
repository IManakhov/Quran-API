import { Module } from '@nestjs/common';
import { DataModule } from '../data/data.module';
import { PageController } from './page.controller';

@Module({
  imports: [DataModule],
  controllers: [PageController],
})
export class PageModule {}
