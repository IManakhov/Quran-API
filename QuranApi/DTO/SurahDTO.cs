using System.Collections.Generic;

namespace QuranApi.DTO
{
    public class SurahDTO : SurahListDTO
    {
        public List<AyatDTO> Ayats { get; set; }
    }
}
