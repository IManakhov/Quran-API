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
