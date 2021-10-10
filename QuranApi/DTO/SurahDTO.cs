using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace QuranApi.DTO
{
    public class SurahDTO : SurahListDTO
    {
        public List<AyatDTO> Ayats { get; set; }
    }
}
