using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuranApi.DTO
{
    public class PageAyatHtmlDTO
    {
        public int page { get; set; }
        public int sura { get; set; }
        public int ayat { get; set; }

        public string html { get; set; }
    }
}
