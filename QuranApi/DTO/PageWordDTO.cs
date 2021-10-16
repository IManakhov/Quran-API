namespace QuranApi.DTO
{
    public class PageWordDTO
    {
        public int glyph_id { get; set; }
        public int sura_number { get; set; }
        public int ayah_number { get; set; }
        public int line_number { get; set; }
        public int position { get; set; }
        public string line_type { get; set; }
        public int glyph_code { get; set; }
        public string font_file { get; set; }
        public string font_file_name => font_file.Replace(".TTF", "").Replace(".woff", "");
        public string charStr => char.ConvertFromUtf32(glyph_code);
    }
}
