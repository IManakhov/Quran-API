import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { DataService } from './data.service';

@ApiTags('data')
@Controller('data')
export class DataController {
  constructor(private readonly data: DataService) {}

  @Get('surah')
  surahList() {
    return this.data.surahList();
  }

  @Get('surah/:surahIndex')
  surah(@Param('surahIndex') surahIndex: string) {
    return this.data.surah(Number(surahIndex));
  }

  @Get('surah/:surahIndex/ayat/:ayatId')
  ayat(@Param('surahIndex') surahIndex: string, @Param('ayatId') ayatId: string) {
    return this.data.ayat(Number(surahIndex), Number(ayatId));
  }

  @Get('page/:id')
  pageGlyph(@Param('id') id: string) {
    return this.data.glyphByPage(Number(id));
  }

  @Get('tafsirs')
  @ApiQuery({ name: 'lang', required: false })
  tafsirs(@Query('lang') lang?: string) {
    return this.data.editions('tafsir', lang);
  }

  @Get('translations')
  @ApiQuery({ name: 'lang', required: false })
  translations(@Query('lang') lang?: string) {
    return this.data.editions('translation', lang);
  }

  @Get('transcriptions')
  @ApiQuery({ name: 'lang', required: false })
  transcriptions(@Query('lang') lang?: string) {
    return this.data.editions('transliteration', lang);
  }
}

