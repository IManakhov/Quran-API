using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using QuranApi.DAO;
using QuranApi.DTO;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace QuranApi.Controllers
{
    [ApiController]
    [ApiVersion("1.0")]
    [Route("data")]
    [EnableCors("AllowAll")]
    public class DataController : ControllerBase
    {
        private IHostingEnvironment _env;
        private IConfiguration _configuration;

        //TODO TO AppSettings
        private QuranDAO quranDAO;

        private readonly ILogger<DataController> _logger;
        //W
        public DataController(IHostingEnvironment env, ILogger<DataController> logger, IConfiguration configuration)
        {
            _logger = logger;
            _env = env;
            _configuration = configuration;
            quranDAO  = new QuranDAO(_configuration.GetConnectionString("DatabaseConnection"));
        }

        [HttpGet]
        [Route("surah")]
        public IEnumerable<SurahListDTO> Surah()
        {
            return quranDAO.SurahList();
        }

        [HttpGet]
        [Route("surah/{surahIndex}")]
        public SurahDTO Surah(int surahIndex)
        {
            return quranDAO.Surah(surahIndex);
        }


        [HttpGet]
        [Route("surah/{surahIndex}/ayat/{ayatId}")]
        public AyatDTO Ayat(int surahIndex, int ayatId)
        {
            return quranDAO.Ayat(surahIndex,ayatId);
        }

        [HttpGet]
        [Route("page/{id}")]
        public List<PageWordDTO> Page(int id)
        {
            return quranDAO.GetPageText(id, 77, 77,77);
        }

        [HttpGet]
        [Route("page")]
        public List<AyatDTO> Page(int id,int tafsirId, int translationId, int transcriptionId)
        {
            return quranDAO.Page(id, tafsirId,translationId, transcriptionId);
        }

        [HttpGet]
        [Route("pagehtml/{id}")]
        [Produces("text/html")] 
        public ContentResult PageHtml(int id)
        {
            var list = Page(id);
            var listPrev = id == 1 ? null : Page(id);

            var fonts = list.Select(x => x.font_file.Replace(".TTF","")).GroupBy(x => x).Select(x => x.Key);
            var fontStyle = fonts
                .Select(x => "@font-face {font-family: " + x + "; " +
                "src: url(\"https://imanakhov.github.io/fonts/" + x.ToLower() + ".ttf\") format(\"opentype\");}");
            var text_fonts = string.Join("", fontStyle);
            var classStyle = fonts.Select(x => ".font" + x + " { font-size:36px;font-family:" + x + ";color:#000;}").ToList();
            var templatePath = Path.Combine($"HtmlTemplate","Madinah_Mushaf_Template","index.html");
            var fileContent = System.IO.File.ReadAllText(templatePath);
            var text_content = new StringBuilder();
            text_content.Append("<div class=\"page\">");
            int line = 0;
            int lastSura = listPrev != null ? listPrev.LastOrDefault().sura_number : 0;
            var ayats = new List<string>();
            foreach (var iter in list) 
            {
                if (lastSura != iter.sura_number) 
                {
                    var sura = Surah(iter.sura_number);
                    text_content.Append("<div class=\"line sura-name\">");
                    text_content.Append("<span>" + sura.NameArabic + "</span>");
                    text_content.Append("</div>");
                }
                if (iter.line_number != line) 
                {
                    if (line != 0)
                        text_content.Append("</div>");
                    text_content.Append("<div class=\"line\">");
                    line = iter.line_number;
                }

                text_content.Append("<span class=\"font" + iter.font_file_name +
                        " ayat-text" + 
                        " sura" + iter.sura_number +
                        " ayat" + iter.sura_number + "_"+ iter.ayah_number + "\">" + iter.charStr + "</span>");
                ayats.Add("ayat" + iter.sura_number + "_" + iter.ayah_number);
                lastSura = iter.sura_number;
            }
            foreach (var ayat in ayats.Distinct()) {
                classStyle.Add("." + ayat + " {}");
            }
            classStyle.Add(".line { text-align: center; }");
            classStyle.Add(".ayat-text { }");
            classStyle.Add(".ayat-text:hover { color: #08e8de; }");
            var text_class = string.Join("", classStyle);
            text_content.Append("</div>");
            text_content.Append("</div>");
            return Content(fileContent
                .Replace("{{text_class}}", text_class)
                .Replace("{{text_fonts}}", text_fonts)
                .Replace("{{text_content}}", text_content.ToString()), "text/html", Encoding.UTF8);
        }

        [HttpGet]
        [Route("pagehtml/{id}/byayats")]
        public List<PageAyatHtmlDTO> PageHtmlByAyats(int id)
        {
            var list = Page(id);
            List<PageAyatHtmlDTO> result = new List<PageAyatHtmlDTO>();
            var metas = list.Select(x => new { x.sura_number, x.ayah_number, x.line_number })
                .Distinct().ToList();
            var listPrev = id == 1 ? null : Page(id);
            var prevAyat = metas.First().ayah_number;

            foreach (var meta in metas.GroupBy(x => new { x.sura_number, x.ayah_number }))
            {
                var fonts = list.Select(x => x.font_file.Replace(".TTF", "")).GroupBy(x => x).Select(x => x.Key);
                var fontStyle = fonts
                    .Select(x => "@font-face {font-family: " + x + "; " +
                    "src: url(\"https://imanakhov.github.io/fonts/" + x.ToLower() + ".ttf\") format(\"opentype\");}");
                var text_fonts = string.Join("", fontStyle);
                var classStyle = fonts.Select(x => ".font" + x + " { font-size:36px;font-family:" + x + ";color:#000;}").ToList();
                var templatePath = Path.Combine($"HtmlTemplate", "Madinah_Mushaf_Template", "index.html");
                var fileContent = System.IO.File.ReadAllText(templatePath);
                var text_content = new StringBuilder();
                text_content.Append("<div class=\"page\">");
                int line = 0;
                int lastSura = listPrev != null ? listPrev.LastOrDefault().sura_number : 0;
                var ayats = new List<string>();
                var subList = list.Where(x => meta.Any(y => y.line_number == x.line_number));
                foreach (var iter in subList)
                {
                    if (iter.line_number != line)
                    {
                        if (line != 0)
                            text_content.Append("</div>");
                        text_content.Append("<div class=\"line\">");
                        line = iter.line_number;
                    }

                    text_content.Append("<span class=\"font" + iter.font_file_name +
                            " ayat-text" +
                            (iter.sura_number == meta.Key.sura_number 
                                && iter.ayah_number == meta.Key.ayah_number ? "" : " invisible-text") +
                            " sura" + iter.sura_number +
                            " ayat" + iter.sura_number + "_" + iter.ayah_number + "\">" + iter.charStr + "</span>");
                    ayats.Add("ayat" + iter.sura_number + "_" + iter.ayah_number);
                    lastSura = iter.sura_number;
                }
                foreach (var ayat in ayats.Distinct())
                {
                    classStyle.Add("." + ayat + " {}\n");
                }
                classStyle.Add(".line { text-align: center; }");
                classStyle.Add(".ayat-text {  }");
                classStyle.Add(".ayat-text:hover { color: #08e8de !important; cursor: pointer; cursor: pointer !important; }");
                classStyle.Add(@".invisible-text { color: white !important;
                            -moz-user-select: none;
                            -webkit-user-select: none;
                            -ms-user-select: none;
                            user-select: none;
                            -o-user-select: none;}");
                classStyle.Add(@".invisible-text:hover { color: white !important;
                            cursor: default !important;
                            -moz-user-select: none;
                            -webkit-user-select: none;
                            -ms-user-select: none;
                            user-select: none;
                            -o-user-select: none;}");
                var text_class = string.Join("", classStyle);
                text_content.Append("</div>");
                text_content.Append("</div>");

                result.Add(new PageAyatHtmlDTO {
                    page = id,
                    sura = meta.Key.sura_number,
                    ayat = meta.Key.ayah_number,
                    html = fileContent
                            .Replace("{{text_class}}", text_class)
                            .Replace("{{text_fonts}}", text_fonts)
                            .Replace("{{text_content}}", text_content.ToString())
                });
            }
            
            return result;
        }

        [HttpGet]
        [Route("tafsirs")]
        public List<EditionDTO> Tafsirs(string lang)
        {
            return quranDAO.Tafsirs(lang);
        }

        [HttpGet]
        [Route("translations")]
        public List<EditionDTO> Translations(string lang)
        {
            return quranDAO.Translations(lang);
        }

        [HttpGet]
        [Route("transcriptions")]
        public List<EditionDTO> Transcriptions(string lang)
        {
            return quranDAO.Transcriptions(lang);
        }
    }
}
