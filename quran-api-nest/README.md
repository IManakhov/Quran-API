## Quran API (NestJS)

Перенос `QuranApi` (ASP.NET Core) на NestJS со Swagger и доступом к MySQL.

### Запуск

1) Создай `.env` на основе примера:

```bash
cd quran-api-nest
cp .env.example .env
```

2) Укажи параметры MySQL в `.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

3) Запусти:

```bash
npm install
npm run start:dev
```

Swagger: `http://localhost:3000/swagger`

### Эндпоинты (как в старом API)

- `GET /data/surah`
- `GET /data/surah/:surahIndex`
- `GET /data/surah/:surahIndex/ayat/:ayatId`
- `GET /data/page/:id` (glyph metadata)
- `GET /data/page?id=&tafsirId=&translationId=&transcriptionId=`
- `GET /data/pagehtml/:id` (читает HTML из `PAGES_DIR`)
- `GET /data/pagehtml/:id/byayats` (читает JSON из `PAGES_BY_AYATS_DIR`)
- `GET /data/tafsirs?lang=`
- `GET /data/translations?lang=`
- `GET /data/transcriptions?lang=`

### Статические файлы страниц

По умолчанию используются директории из старого проекта:

- `PAGES_DIR=../QuranApi/pages`
- `PAGES_BY_AYATS_DIR=../QuranApi/pages_by_ayats`

### Дамп базы

В репо есть `DataBase/quran_api.zip` (MySQL). Разверни его в локальную MySQL и пропиши подключение в `.env`.

### Важно про секреты

В старом проекте пароль БД лежит в `QuranApi/appsettings.json`. Рекомендуется сменить пароль/перевести на env.

