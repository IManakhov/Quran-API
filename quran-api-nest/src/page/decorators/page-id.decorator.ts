import { Param, ParseIntPipe } from '@nestjs/common';
import { PageIdPipe } from '../pipes/page-id.pipe';

export const PageId = () => Param('id', ParseIntPipe, new PageIdPipe());
