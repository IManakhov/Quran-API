import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as path from 'path';
import { promises as fs } from 'fs';
import { DataService } from '../data/data.service';
import { ParseIntPipe } from '@nestjs/common';
import { PageId } from './decorators/page-id.decorator';

@ApiTags('page')
@Controller('page')
export class PageController {
  constructor(private readonly data: DataService) {}

  @Get(':id')
  @ApiQuery({ name: 'tafsirId', required: false })
  @ApiQuery({ name: 'translationId', required: false })
  @ApiQuery({ name: 'transcriptionId', required: false })
  page(
    @PageId() id: number, 
    @Query('tafsirId', ParseIntPipe) tafsirId?: number, 
    @Query('translationId', ParseIntPipe) translationId?: number, 
    @Query('transcriptionId', ParseIntPipe) transcriptionId?: number) {
    return this.data.page(id, tafsirId ?? 0, translationId ?? 0, transcriptionId ?? 0);
  }

  @Get('html/:id')
  async pageHtml(@PageId() id: number, @Res() res: Response) {
    const pagesDir = process.env.PAGES_DIR ?? 'static/pages_v1';
    const filePath = path.resolve(process.cwd(), pagesDir, `${id}.html`);
    const html = await fs.readFile(filePath, 'utf-8');
    return res.type('text/html; charset=utf-8').send(html);
  }

  @Get('html/:id/v2/tajweed')
  async pageV2TajweedHtml(@PageId() id: number, @Res() res: Response) {
    const pagesDir = process.env.PAGES_DIR ?? 'static/pages_v2_tajweed';
    const filePath = path.resolve(process.cwd(), pagesDir, `${id}.html`);
    const html = await fs.readFile(filePath, 'utf-8');
    return res.type('text/html; charset=utf-8').send(html);
  }

  @Get('html/:id/v2')
  async pageV2tml(@PageId() id: number, @Res() res: Response) {
    const pagesDir = process.env.PAGES_DIR ?? 'static/pages_v2';
    const filePath = path.resolve(process.cwd(), pagesDir, `${id}.html`);
    const html = await fs.readFile(filePath, 'utf-8');
    return res.type('text/html; charset=utf-8').send(html);
  }

  @Get('html/byayats/:id/')
  async pageHtmlByAyats(@PageId() id: number, @Res() res: Response) {
    const dir = process.env.PAGES_DIR ?? 'static/pages_by_ayats';
    const filePath = path.resolve(process.cwd(), dir, `${id}.json`);
    const json = await fs.readFile(filePath, 'utf-8');
    return res.type('application/json; charset=utf-8').send(json);
  }
}
