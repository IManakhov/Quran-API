![Bismillah-Al-Rahman-Al-Rahim](https://quran-api.shkolaproroka.ru/content/Bismillah-Al-Rahman-Al-Rahim-Title.png "Bismillah-Al-Rahman-Al-Rahim")
--------
# Quran-API project
This project was made to help others to work with Quran. Tags: _#Quran#QuranAPI#Quran-API#Koran#KoranAPI#Koran-API#القرآن‎_
###### Example of swagger you can see at: [https://quran-api.nabi-school.education/swagger/index](https://quran-api.nabi-school.education/swagger/index.html)

### Main functionality of Quran API
--------
- Get metadata
    - By Page https://quran-api.nabi-school.education/data/page/1
    - By Surah https://quran-api.nabi-school.education/data/surah/1
    - By Ayat of Surah https://quran-api.nabi-school.education/data/surah/1/ayat/1
- Get html page of Quran page with correct markup https://quran-api.nabi-school.education/data/pagehtml/1
- Get html pages splitted by ayat of Quran page with correct markup https://quran-api.nabi-school.education/data/pagehtml/1/byayats

### How to lunch app
--------
This is ASP .NET Core application based on Web API. Database - MySQL. Dump you can found at `./DataBase/quran_api.zip`
### Features that need to do
--------
- [ ] Cache all pages and pages splitted by ayats to content page. Now it's generation on every request
