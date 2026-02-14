import { Module } from '@nestjs/common';
import { DataController } from './data.controller';
import { DataService } from './data.service';
import { MysqlService } from '../db/mysql.service';

@Module({
  controllers: [DataController],
  providers: [DataService, MysqlService],
  exports: [DataService],
})
export class DataModule {}

