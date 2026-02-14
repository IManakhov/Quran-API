import { Injectable } from '@nestjs/common';
import { MysqlService } from '../db/mysql.service';

@Injectable()
export class DataService {
  constructor(private readonly mysql: MysqlService) {}

  async surahList() {
    const sql =
      'SELECT ' +
      'id as `Index`, ' +
      'name as NameArabic, ' +
      'englishname as NameLang, ' +
      'englishtranslation as NameTranslate, ' +
      'revelationCity as City, ' +
      'numberOfAyats as AyatCount ' +
      'FROM surat ORDER BY id ASC';

    const [rows] = await this.mysql.getPool().query(sql);
    return rows;
  }

  async ayats(surahIndex: number) {
    const sql =
      'SELECT ' +
      'number as `Index`, ' +
      'surat_id as SuratIndex, ' +
      'edition_id as EditionId, ' +
      'juz_id as JuzId, ' +
      'text as TextOrigin, ' +
      'numberinsurat as NumberInSurah, ' +
      'manzil_id as ManzilId, ' +
      'page_id as PageId, ' +
      'ruku_id as RukuId, ' +
      'sajda_id as SajdaId, ' +
      'hizbQuarter_id as HizbQuarterId, ' +
      "'' as TextTafsir, " +
      "'' as TextTranslate, " +
      "'' as TextTranscription " +
      'FROM ayat WHERE edition_id = ? AND surat_id = ?';

    const [rows] = await this.mysql.getPool().query(sql, [77, surahIndex]);
    return rows;
  }

  async surah(surahIndex: number) {
    const sql =
      'SELECT ' +
      'id as `Index`, ' +
      'name as NameArabic, ' +
      'englishname as NameLang, ' +
      'englishtranslation as NameTranslate, ' +
      'revelationCity as City, ' +
      'numberOfAyats as AyatCount ' +
      'FROM surat WHERE id = ?';

    const [rows] = await this.mysql.getPool().query<any[]>(sql, [surahIndex]);
    const surah = rows[0];
    if (!surah) return null;
    surah.Ayats = await this.ayats(surahIndex);
    return surah;
  }

  async ayat(surahIndex: number, ayatIndex: number) {
    const sql =
      'SELECT ' +
      'number as `Index`, ' +
      'surat_id as SuratIndex, ' +
      'edition_id as EditionId, ' +
      'juz_id as JuzId, ' +
      'text as TextOrigin, ' +
      'numberinsurat as NumberInSurah, ' +
      'manzil_id as ManzilId, ' +
      'page_id as PageId, ' +
      'ruku_id as RukuId, ' +
      'sajda_id as SajdaId, ' +
      'hizbQuarter_id as HizbQuarterId, ' +
      "'' as TextTafsir, " +
      "'' as TextTranslate, " +
      "'' as TextTranscription " +
      'FROM ayat WHERE edition_id = ? AND surat_id = ? AND number = ?';

    const [rows] = await this.mysql.getPool().query<any[]>(sql, [77, surahIndex, ayatIndex]);
    return rows[0] ?? null;
  }

  async page(pageId: number, tafsirId: number, translateId: number, transcriptionId: number) {
    const sourceStr =
      'SELECT number, surat_id, edition_id, juz_id, text, numberinsurat, manzil_id, page_id, ruku_id, sajda_id, hizbQuarter_id FROM ayat';

    const sql =
      'SELECT ' +
      's.number as `Index`, ' +
      's.surat_id as SuratIndex, ' +
      's.edition_id as EditionId, ' +
      's.juz_id as JuzId, ' +
      's.text as TextOrigin, ' +
      's.numberinsurat as NumberInSurah, ' +
      's.manzil_id as ManzilId, ' +
      's.page_id as PageId, ' +
      's.ruku_id as RukuId, ' +
      's.sajda_id as SajdaId, ' +
      's.hizbQuarter_id as HizbQuarterId, ' +
      'taf.text as TextTafsir, ' +
      'trn.text as TextTranslate, ' +
      'transc.text as TextTranscription ' +
      `FROM (${sourceStr} WHERE edition_id = ? AND page_id = ?) as s ` +
      `LEFT JOIN (${sourceStr} WHERE edition_id = ? AND page_id = ?) as taf ON taf.page_id = s.page_id AND taf.number = s.number ` +
      `LEFT JOIN (${sourceStr} WHERE edition_id = ? AND page_id = ?) as trn ON trn.page_id = s.page_id AND trn.number = s.number ` +
      `LEFT JOIN (${sourceStr} WHERE edition_id = ? AND page_id = ?) as transc ON transc.page_id = s.page_id AND transc.number = s.number`;

    const params = [77, pageId, tafsirId, pageId, translateId, pageId, transcriptionId, pageId];
    const [rows] = await this.mysql.getPool().query(sql, params);
    return rows;
  }

  async glyphByPage(pageId: number) {
    const sql =
      'SELECT t.glyph_ayah_id,t.glyph_id,t.sura_number,t.ayah_number, l.line_number,l.position, l.line_type, l.font_file, l.glyph_code FROM ' +
      '(SELECT DISTINCT t.glyph_ayah_id,t.glyph_id,t.sura_number,t.ayah_number FROM glyph_ayah AS t ' +
      'LEFT JOIN ayat AS a ON a.surat_id = t.sura_number AND a.numberinsurat = t.ayah_number ' +
      'WHERE a.page_id = ? ORDER BY t.glyph_ayah_id) AS t ' +
      'LEFT JOIN (SELECT t.glyph_id,t.page_number, t.line_number,t.position, t.line_type, g.font_file, g.glyph_code FROM glyph_page_line AS t ' +
      'LEFT JOIN glyph AS g ON t.glyph_id = g.glyph_id ' +
      'WHERE t.page_number = ? ORDER BY t.glyph_page_line_id) AS l ON l.glyph_id = t.glyph_id';

    const [rows] = await this.mysql.getPool().query(sql, [pageId, pageId]);
    return rows;
  }

  async editions(type: 'tafsir' | 'translation' | 'transliteration', lang?: string) {
    let sql =
      'SELECT id as Id, identifier as Identifier, language as Language, name as Name FROM edition WHERE type = ?';
    const params: any[] = [type];
    if (lang) {
      sql += ' AND language = ?';
      params.push(lang);
    }
    const [rows] = await this.mysql.getPool().query(sql, params);
    return rows;
  }
}

