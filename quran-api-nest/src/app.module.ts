import { Module } from '@nestjs/common';
import { DataModule } from './data/data.module';
import { PageModule } from './page/page.module';

@Module({
  imports: [DataModule, PageModule],
})
export class AppModule {}

