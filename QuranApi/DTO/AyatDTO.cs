namespace QuranApi.DTO
{
    public class AyatDTO
    {
        public int Index { get; set; }

        public string TextOrigin { get; set; } 

        public string TextTafsir { get; set; }

        public string TextTranslate { get; set; }

        public string TextTranscription { get; set; }

        public int SuratIndex { get; set; }
        public int EditionId { get; set; }
        public int JuzId { get; set; }
        public int NumberInSurah { get; set; }

        public int ManzilId { get; set; }
        public int PageId { get; set; }
        public int RukuId { get; set; }
        public int SajdaId { get; set; }
        public int HizbQuarterId { get; set; }
    }
}
