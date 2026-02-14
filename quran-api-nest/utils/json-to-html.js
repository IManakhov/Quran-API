/**
 * Генерирует HTML файлы из JSON данных страниц Корана
 * Аналогично C# методу PageHtmlToFileInternal()
 *
 * Запуск: node json-to-html.js
 */

const fs = require('fs');
const path = require('path');

const STATIC_DIR = path.resolve(__dirname, '../static');
const LEGACY_UTILS_DIR = __dirname;

function resolveDefaultPath(staticPath, legacyPath) {
  if (fs.existsSync(staticPath)) return staticPath;
  return legacyPath;
}

const PAGES_JSON_DIR =
  process.env.JSON_PAGES_DIR ??
  resolveDefaultPath(path.join(STATIC_DIR, 'pages_json'), path.join(LEGACY_UTILS_DIR, 'pages_json'));
const OUT_DIR =
  process.env.HTML_OUT_DIR ??
  resolveDefaultPath(path.join(STATIC_DIR, 'pages_v2_tajweed'), path.join(LEGACY_UTILS_DIR, 'pagesV2_tajweed'));
const TEMPLATE_DIR =
  process.env.HTML_TEMPLATE_DIR ??
  resolveDefaultPath(
    path.join(STATIC_DIR, 'HtmlTemplate', 'Madinah_Mushaf_Template'),
    path.join(LEGACY_UTILS_DIR, 'HtmlTemplate', 'Madinah_Mushaf_Template'),
  );
const TEMPLATE_FILE = path.join(TEMPLATE_DIR, 'index.html');
const FONTS_DIR =
  process.env.HTML_FONTS_DIR ??
  resolveDefaultPath(path.join(STATIC_DIR, 'fonts'), path.join(LEGACY_UTILS_DIR, 'fonts'));
const BASE_FONT_URL = 'https://imanakhov.github.io/fonts/colored';

/**
 * Определяет номер шрифта по индексу символа
 * В оригинальном коде используется quranFontDictionary[itenNumber]
 * Здесь используем простую логику: номер шрифта = номер страницы
 * Можно изменить логику при необходимости
 */
function getFontNumber(pageId, charIndex) {
  // Базовая логика: используем номер страницы как номер шрифта
  // Можно изменить на более сложную логику при наличии данных
  return String(pageId);
}

/**
 * Определяет имя файла шрифта
 */
function getFontFileName(pageId, charIndex) {
  const fontNum = getFontNumber(pageId, charIndex);
  return `p${fontNum}`;
}

/**
 * Проверяет существование шрифта
 */
function fontExists(fontName) {
  const fontPath = path.join(FONTS_DIR, `${fontName}.ttf`);
  return fs.existsSync(fontPath);
}

/**
 * Читает данные страницы из JSON
 */
function loadPageData(pageId) {
  const jsonPath = path.join(PAGES_JSON_DIR, `${pageId}.json`);
  if (!fs.existsSync(jsonPath)) {
    return null;
  }
  const content = fs.readFileSync(jsonPath, 'utf8');
  return JSON.parse(content);
}

/**
 * Генерирует CSS для @font-face
 */
function generateFontFaces(pageId, fonts) {
  return fonts.map(fontName => {
    return `@font-face {font-family: ${fontName}; src: url("${BASE_FONT_URL}/${fontName}.ttf") format("truetype");}`;
  }).join('\n');
}

/**
 * Генерирует CSS классы для шрифтов
 */
function generateFontClasses(pageId, fonts) {
  return fonts.map(fontName => {
    return `.font${fontName} { font-size:36px;font-family: ${fontName};color:#000;}`;
  });
}

/**
 * Генерирует HTML контент страницы
 */
function generatePageContent(pageId, pageData, prevPageData) {
  const textContent = [];
  textContent.push('<div class="page">');
  
  let currentLine = 0;
  let isLineOpen = false;
  const ayats = new Set();
  let itemNumber = 1;
  
  const closeLineIfOpen = () => {
    if (isLineOpen) {
      textContent.push('</div>');
      isLineOpen = false;
    }
  };

  for (const item of pageData) {
    // Если изменилась сура, добавляем название суры
    if (item.symbol === 'surah_name') {
      closeLineIfOpen();
      const surahNumber = item.surah < 10 ? `0${item.surah}` : item.surah;
      textContent.push('<div class="line sura-name sura-name-container">');
      textContent.push('<img src="https://understandquran.com/quran/images/surah_header2.png" alt="" aria-hidden="true" class="sura-name-bg">');
      textContent.push(`<img src="https://understandquran.com/quran/surah_svg/Black/Black_${surahNumber}.svg" alt="${item.symbol}" class="sura-name-title">`);
      textContent.push('</div>');
      currentLine = item.line;
      continue;
    }
    if (item.symbol === 'basmallah') {
      closeLineIfOpen();
      textContent.push('<div class="line basmallah">');
      textContent.push(`<span class="fontp1">ﱁ ﱂ ﱃ ﱄ</span>`);
      textContent.push('</div>');
      currentLine = item.line;
      continue;
    }

    // Если изменилась строка, закрываем предыдущую и открываем новую
    if (!isLineOpen || item.line !== currentLine) {
      closeLineIfOpen();
      textContent.push('<div class="line">');
      isLineOpen = true;
      currentLine = item.line;
    }
    
    // Определяем шрифт для символа
    const fontFileName = getFontFileName(pageId, item.index);
    // Пока нет данных о сурах и аятах в JSON, используем значения по умолчанию
    const suraNumber = item.surah || 0;
    const ayahNumber = item.ayat || 0;
    
    // Используем символ из JSON (quranFontDictionary[itenNumber] в оригинале)
    const symbol = item.symbol;
    
    // Рендерим пробелы как отдельный блок фиксированной ширины.
    if (/^ +$/.test(symbol)) {
      const widthPx = symbol.length * 9;
      textContent.push(`<span class="ayat-space" style="width:${widthPx}px"></span>`);
      itemNumber++;
      continue;
    }

    const leadingSpaces = (symbol.match(/^ +/)?.[0].length) ?? 0;
    if (leadingSpaces > 0) {
      const widthPx = leadingSpaces * 9;
      textContent.push(`<span class="ayat-space" style="width:${widthPx}px"></span>`);
    }

    const visibleSymbol = symbol.slice(leadingSpaces);

    // Экранируем HTML символы.
    const escapedSymbol = visibleSymbol
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
    
    // Формируем классы
    const classes = [
      `font${fontFileName}`,
      'ayat-text'
    ];
    
    // Добавляем классы суры и аята только если они есть
    if (suraNumber > 0) {
      classes.push(`sura${suraNumber}`);
    }
    if (suraNumber > 0 && ayahNumber > 0) {
      const ayatClass = `ayat${suraNumber}_${ayahNumber}`;
      classes.push(ayatClass);
      ayats.add(ayatClass);
    }
    
    textContent.push(`<span class="${classes.join(' ')}">${escapedSymbol}</span>`);
    
    itemNumber++;
  }
  
  // Закрываем последнюю строку
  closeLineIfOpen();
  
  textContent.push('</div>');
  
  return {
    content: textContent.join(''),
    ayats: Array.from(ayats)
  };
}

/**
 * Генерирует HTML файл для страницы
 */
function generateHtmlPage(pageId) {
  const pageData = loadPageData(pageId);
  if (!pageData || pageData.length === 0) {
    console.warn(`Страница ${pageId}: нет данных`);
    return;
  }
  
  // Загружаем данные предыдущей страницы
  const prevPageId = pageId > 1 ? pageId - 1 : null;
  const prevPageData = prevPageId ? loadPageData(prevPageId) : null;
  
  const fontsArray = Array.from(["p1", `p${pageId}`]).sort();
  // Генерируем стили шрифтов
  const fontFaces = generateFontFaces(pageId, fontsArray);
  const fontClasses = generateFontClasses(pageId, fontsArray);
  
  // Генерируем контент
  const { content, ayats } = generatePageContent(pageId, pageData, prevPageData);
  
  // Добавляем стили для аятов
  const ayatClasses = ayats.map(ayat => `.${ayat} {}`).join('\n');
  
  // Собираем все стили
  const allStyles = [
    ...fontClasses,
    ayatClasses,
    '.ayat-space { display: inline-block; width: 9px; }',
    '.line { text-align: center; justify-content: center; align-items: center; }',
    '.sura-name-container { position: relative; width: 100%; min-height: 72px; display: flex; justify-content: center; align-items: center; }',
    '.sura-name-bg { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 100%; max-width: 620px; height: auto; z-index: 1; }',
    '.sura-name-title { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); width: 220px; height: 50px; z-index: 2; }',
    '.ayat-text { }',
    '.ayat-text:hover { color: #08e8de; }'
  ].join('\n');
  
  // Читаем шаблон
  let templateContent = '';
  if (fs.existsSync(TEMPLATE_FILE)) {
    templateContent = fs.readFileSync(TEMPLATE_FILE, 'utf8');
  } else {
    // Если шаблона нет, создаем базовый
    templateContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Page ${pageId}</title>
    <style>
        {{text_class}}
        {{text_fonts}}
    </style>
</head>
<body>
    {{text_content}}
</body>
</html>`;
  }
  
  // Заменяем плейсхолдеры
  const htmlContent = templateContent
    .replace('{{text_class}}', allStyles)
    .replace('{{text_fonts}}', fontFaces)
    .replace('{{text_content}}', content);
  
  // Сохраняем файл
  const outputPath = path.join(OUT_DIR, `${pageId}.html`);
  fs.writeFileSync(outputPath, htmlContent, 'utf8');
  
  console.log(`Страница ${pageId} -> ${outputPath} (${pageData.length} символов, ${fontsArray.length} шрифтов)`);
}

/**
 * Главная функция
 */
function main() {
  if (!fs.existsSync(PAGES_JSON_DIR)) {
    console.error(`Папка JSON не найдена: ${PAGES_JSON_DIR}. Сначала запустите: node docx-to-json.js`);
    process.exit(1);
  }
  
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    console.log('Создана папка:', OUT_DIR);
  }
  
  // Создаем папку для шаблона, если её нет
  if (!fs.existsSync(TEMPLATE_DIR)) {
    fs.mkdirSync(TEMPLATE_DIR, { recursive: true });
    console.log('Создана папка для шаблона:', TEMPLATE_DIR);
    console.log('Поместите файл index.html в эту папку или скрипт использует базовый шаблон');
  }
  
  const files = fs.readdirSync(PAGES_JSON_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => parseInt(path.basename(f, '.json')))
    .filter(id => !isNaN(id))
    .sort((a, b) => a - b);
  
  if (files.length === 0) {
    console.log(`В папке ${PAGES_JSON_DIR} нет JSON файлов`);
    return;
  }
  
  console.log(`Найдено страниц: ${files.length}\n`);
  
  for (const pageId of files) {
    try {
      generateHtmlPage(pageId);
    } catch (err) {
      console.error(`Ошибка при обработке страницы ${pageId}:`, err.message);
    }
  }
  
  console.log('\nГотово.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
