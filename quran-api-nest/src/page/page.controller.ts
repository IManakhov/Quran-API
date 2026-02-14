import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import * as path from 'path';
import { promises as fs } from 'fs';
import { DataService } from '../data/data.service';

@ApiTags('page')
@Controller('page')
export class PageController {
  constructor(private readonly data: DataService) {}

  @Get(':id')
  @ApiQuery({ name: 'tafsirId', required: false })
  @ApiQuery({ name: 'translationId', required: false })
  @ApiQuery({ name: 'transcriptionId', required: false })
  page(
    @Param('id') id: string, 
    @Query('tafsirId') tafsirId?: string, 
    @Query('translationId') translationId?: string, 
    @Query('transcriptionId') transcriptionId?: string) {
    return this.data.page(Number(id), Number(tafsirId), Number(translationId), Number(transcriptionId));
  }

  @Get('html/:id')
  async pageHtml(@Param('id') id: string, @Res() res: Response) {
    const pagesDir = process.env.PAGES_DIR ?? 'static/pages_v1';
    const filePath = path.resolve(process.cwd(), pagesDir, `${id}.html`);
    const html = await fs.readFile(filePath, 'utf-8');
    res.type('text/html; charset=utf-8').send(html);
  }

  @Get('html/:id/v2/tajweed')
  async pageV2TajweedHtml(@Param('id') id: string, @Res() res: Response) {
    const pagesDir = process.env.PAGES_DIR ?? 'static/pages_v2_tajweed';
    const filePath = path.resolve(process.cwd(), pagesDir, `${id}.html`);
    const html = await fs.readFile(filePath, 'utf-8');
    res.type('text/html; charset=utf-8').send(html);
  }

  @Get('html/:id/v2')
  async pageV2tml(@Param('id') id: string, @Res() res: Response) {
    const pagesDir = process.env.PAGES_DIR ?? 'static/pages_v2';
    const filePath = path.resolve(process.cwd(), pagesDir, `${id}.html`);
    const html = await fs.readFile(filePath, 'utf-8');
    res.type('text/html; charset=utf-8').send(html);
  }

  @Get('html/byayats/:id/')
  async pageHtmlByAyats(@Param('id') id: string, @Res() res: Response) {
    const dir = process.env.PAGES_DIR ?? 'static/pages_by_ayats';
    const filePath = path.resolve(process.cwd(), dir, `${id}.json`);
    const json = await fs.readFile(filePath, 'utf-8');
    res.type('application/json; charset=utf-8').send(json);
  }
}
