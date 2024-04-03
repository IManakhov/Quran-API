![Bismillah-Al-Rahman-Al-Rahim](https://imanakhov.github.io/images/Bismillah.png "Bismillah-Al-Rahman-Al-Rahim")
--------
# Quran-API project
This project was made to help others to work with Quran. Tags: _#Quran#QuranAPI#Quran-API#Koran#KoranAPI#Koran-API#القرآن‎_
###### Example of swagger you can see at: [https://quran.mistudio.dev/swagger/index](https://quran-api.nabi-school.education/swagger/index.html)

### Main functionality of Quran API
--------
- Get metadata
    - By Page https://quran.mistudio.dev/data/page/1
    - By Surah https://quran.mistudio.dev/data/surah/1
    - By Ayat of Surah https://quran.mistudio.dev/data/surah/1/ayat/1
- Get html page of Quran page with correct markup https://quran.mistudio.dev/pages/1/index.html, you can replace 1 to another page number from 1 to 604
- Get html pages splitted by ayat of Quran page with correct markup https://quran.mistudio.dev/data/pagehtml/1/byayats

### How to lunch app
--------
This is ASP .NET Core application based on Web API. Database - MySQL. Dump you can found at `./DataBase/quran_api.zip`
