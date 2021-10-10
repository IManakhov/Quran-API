using Dapper;
using MySql.Data.MySqlClient;
using QuranApi.DTO;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;

namespace QuranApi.DAO
{
    public class QuranDAO
    {
        string connectionString = null;
        public QuranDAO(string conn)
        {
            connectionString = conn;
        }

        public List<SurahListDTO> SurahList()
        {
            using (IDbConnection db = new MySqlConnection(connectionString))
            {
                return db.Query<SurahListDTO>("SELECT " +
                     "id as \"Index\"," +
                     "name as NameArabic," +
                     "englishname as NameLang," +
                     "englishtranslation as NameTranslate," +
                     "revelationCity as City," +
                     "numberOfAyats as AyatCount " +
                     "FROM surat ORDER BY id ASC")
                    .ToList();
            }
        }

        public SurahDTO Surah(int surahIndex)
        {
            using (IDbConnection db = new MySqlConnection(connectionString))
            {
                var surah = db.Query<SurahDTO>("SELECT " +
                     "id as \"Index\"," +
                     "name as NameArabic," +
                     "englishname as NameLang," +
                     "englishtranslation as NameTranslate," +
                     "revelationCity as City," +
                     "numberOfAyats as AyatCount " +
                     "FROM surat WHERE id = " + surahIndex)
                    .FirstOrDefault();

                if (surah != null) {
                    surah.Ayats = Ayats(surahIndex);
                }
                return surah;
            }
        }

        public List<AyatDTO> Ayats(int surahIndex) {

            using (IDbConnection db = new MySqlConnection(connectionString))
            {
                var sqlStr = "SELECT " +
                    "number as \"Index\"," +
                    "surat_id as SuratIndex," +
                    "edition_id as EditionId," +
                    "juz_id as JuzId," +
                    "text as TextOrigin," +
                    "numberinsurat as NumberInSurah," +
                    "manzil_id as ManzilId," +
                    "page_id as PageId," +
                    "ruku_id as RukuId," +
                    "sajda_id as SajdaId," +
                    "hizbQuarter_id as HizbQuarterId," +
                    "'' as TextTafsir," +
                    "'' as TextTranslate" +
                     " FROM ayat WHERE edition_id = 77 AND surat_id = " + surahIndex;
                return db.Query<AyatDTO>(sqlStr)
                    .ToList();
            }
        }

        public AyatDTO Ayat(int surahIndex, int ayatIndex)
        {

            using (IDbConnection db = new MySqlConnection(connectionString))
            {
                var sqlStr = "SELECT " +
                    "number as \"Index\"," +
                    "surat_id as SuratIndex," +
                    "edition_id as EditionId," +
                    "juz_id as JuzId," +
                    "text as TextOrigin," +
                    "numberinsurat as NumberInSurah," +
                    "manzil_id as ManzilId," +
                    "page_id as PageId," +
                    "ruku_id as RukuId," +
                    "sajda_id as SajdaId," +
                    "hizbQuarter_id as HizbQuarterId," +
                    "'' as TextTafsir," +
                    "'' as TextTranslate" +
                    " FROM ayat WHERE edition_id = 77 AND surat_id = " + surahIndex +
                    " AND number = " + ayatIndex;
                return db.Query<AyatDTO>(sqlStr)
                    .First();
            }
        }

        public List<AyatDTO> Page(int page, int tafsirId, int translateId, int transcriptionId)
        {

            using (IDbConnection db = new MySqlConnection(connectionString))
            {
                var sqlStr = GetPageStr(page, 77, tafsirId, translateId, transcriptionId);
                return db.Query<AyatDTO>(sqlStr)
                    .ToList();
            }
        }

        protected string GetPageStr(int page, int editionId, int tafsirId, int translateId, int transcriptionId)
        {
            var sourceStr = "SELECT " +
                        "number," +
                        "surat_id," +
                        "edition_id," +
                        "juz_id," +
                        "text," +
                        "numberinsurat," +
                        "manzil_id," +
                        "page_id," +
                        "ruku_id," +
                        "sajda_id," +
                        "hizbQuarter_id " +
                        " FROM ayat ";

            var str = "SELECT " +
                        "s.number as \"Index\"," +
                        "s.surat_id as SuratIndex," +
                        "s.edition_id as EditionId," +
                        "s.juz_id as JuzId," +
                        "s.text as TextOrigin," +
                        "s.numberinsurat as NumberInSurah," +
                        "s.manzil_id as ManzilId," +
                        "s.page_id as PageId," +
                        "s.ruku_id as RukuId," +
                        "s.sajda_id as SajdaId," +
                        "s.hizbQuarter_id as HizbQuarterId," +
                        "taf.text as TextTafsir," +
                        "trn.text as TextTranslate, " +
                        "transc.text as TextTranscription FROM (" + sourceStr + " WHERE edition_Id = " + editionId +
                            " AND page_id = " + page + " ) as s " +
                        "LEFT JOIN (" + sourceStr + " WHERE edition_Id= " + tafsirId +
                            " AND page_id = " + page + " ) as taf ON taf.page_Id = s.page_Id AND taf.number = s.number " +
                        "LEFT JOIN (" + sourceStr + " WHERE edition_Id= " + translateId +
                            " AND page_id = " + page + " ) as trn ON trn.page_Id = s.page_Id AND trn.number = s.number " +
                        "LEFT JOIN (" + sourceStr + " WHERE edition_Id= " + transcriptionId +
                            " AND page_id = " + page + " ) as transc ON transc.page_Id = s.page_Id AND transc.number = s.number" +
                            "";
            return str;
        }

        public List<PageWordDTO> GetPageText(int page, int tafsirId, int translateId, int transcriptionId)
        {
            using (IDbConnection db = new MySqlConnection(connectionString))
            {
                var sqlStr = GetGylphByPage(page);
                var result = db.Query<PageWordDTO>(sqlStr)
                    .ToList();
                return result;
            }
        }

        protected string GetGylphByPage(int page){
            return @"SELECT t.glyph_ayah_id,t.glyph_id,t.sura_number,t.ayah_number, l.line_number,l.position, l.line_type, l.font_file, l.glyph_code FROM
(SELECT DISTINCT t.glyph_ayah_id,t.glyph_id,t.sura_number,t.ayah_number FROM glyph_ayah AS t
	                    LEFT JOIN ayat AS a ON a.surat_id = t.sura_number AND a.numberinsurat = t.ayah_number
	                 WHERE a.page_id = " + page + @" ORDER BY t.glyph_ayah_id) AS t
LEFT JOIN (SELECT t.glyph_id,t.page_number, t.line_number,t.position, t.line_type, g.font_file, g.glyph_code FROM glyph_page_line AS t
						LEFT JOIN glyph AS g ON t.glyph_id = g.glyph_id
										 WHERE t.page_number = " + page + " ORDER BY t.glyph_page_line_id) AS l ON l.glyph_id = t.glyph_id";
        }

        public List<EditionDTO> Tafsirs(string lang)
        {
            using (IDbConnection db = new MySqlConnection(connectionString))
            {
                var sqlStr = EditionSQL("tafsir", lang);
                return db.Query<EditionDTO>(sqlStr).ToList();
            }
        }
        public List<EditionDTO> Translations(string lang)
        {
            using (IDbConnection db = new MySqlConnection(connectionString))
            {
                var sqlStr = EditionSQL("translation", lang);
                return db.Query<EditionDTO>(sqlStr).ToList();
            }
        }
        public List<EditionDTO> Transcriptions(string lang)
        {
            using (IDbConnection db = new MySqlConnection(connectionString))
            {
                var sqlStr = EditionSQL("transliteration", lang);
                return db.Query<EditionDTO>(sqlStr).ToList();
            }
        }

        protected string EditionSQL(string type, string lang) 
        {
            return "SELECT id as Id, identifier as Identifier, language as Language, name as Name FROM edition " +
                "WHERE type = \""+ type + "\"" +
                (!string.IsNullOrEmpty(lang) ? " AND language = \"" + lang + "\"" : "");
        }
    }
}
