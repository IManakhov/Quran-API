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

  private async sendFile(res: Response, filePath: string, contentType: string) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return res.type(contentType).send(content);
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        return res.status(404).send(`File not found: ${filePath}`);
      }
      throw error;
    }
  }

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
    const pagesDir = process.env.PAGES_V1_DIR ?? process.env.PAGES_DIR ?? 'static/pages_v1';
    const filePath = path.resolve(process.cwd(), pagesDir, `${id}.html`);
    return this.sendFile(res, filePath, 'text/html; charset=utf-8');
  }

  @Get('html/:id/v2/tajweed')
  async pageV2TajweedHtml(@PageId() id: number, @Res() res: Response) {
    const pagesDir = process.env.PAGES_V2_TAJWEED_DIR ?? process.env.PAGES_DIR ?? 'static/pages_v2_tajweed';
    const filePath = path.resolve(process.cwd(), pagesDir, `${id}.html`);
    return this.sendFile(res, filePath, 'text/html; charset=utf-8');
  }

  @Get('html/:id/v2')
  async pageV2tml(@PageId() id: number, @Res() res: Response) {
    const pagesDir = process.env.PAGES_V2_DIR ?? process.env.PAGES_DIR ?? 'static/pages_v2';
    const filePath = path.resolve(process.cwd(), pagesDir, `${id}.html`);
    return this.sendFile(res, filePath, 'text/html; charset=utf-8');
  }

  @Get('html/byayats/:id/')
  async pageHtmlByAyats(@PageId() id: number, @Res() res: Response) {
    const dir = process.env.PAGES_BY_AYATS_DIR ?? 'static/pages_by_ayats';
    const filePath = path.resolve(process.cwd(), dir, `${id}.json`);
    return this.sendFile(res, filePath, 'application/json; charset=utf-8');
  }
}
