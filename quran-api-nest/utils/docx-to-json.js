/**
 * Читает .docx из static/pages_v2_docx/{index}.docx построчно и побуквенно,
 * используя данные из БД qpc-v4-tajweed-15-lines.db для структурирования,
 * записывает в static/pages_json/{index}.json массив:
 * [{ line: 1, position: 1, index: 1, symbol: '', surah: 1, ayat: 1 }, ...]
 *
 * Требует: npm install mammoth sqlite3
 * Запуск: 
 *   node docx-to-json.js                    - обработать все страницы
 *   node docx-to-json.js --page=1           - обработать только страницу 1
 *   node docx-to-json.js --debug            - включить отладочный вывод
 *   node docx-to-json.js --page=1 --debug   - отладка конкретной страницы
 *   npm run docx-to-json:debug              - запуск с отладчиком Node.js
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const STATIC_DIR = path.resolve(__dirname, '../static');
const LEGACY_UTILS_DIR = __dirname;

function resolveDefaultPath(staticPath, legacyPath) {
  if (fs.existsSync(staticPath)) return staticPath;
  return legacyPath;
}

const PAGES_DIR =
  process.env.DOCX_PAGES_DIR ??
  resolveDefaultPath(path.join(STATIC_DIR, 'pages_v2_docx'), path.join(LEGACY_UTILS_DIR, 'pages'));
const OUT_DIR =
  process.env.DOCX_OUT_DIR ??
  resolveDefaultPath(path.join(STATIC_DIR, 'pages_json'), path.join(LEGACY_UTILS_DIR, 'pages_json'));
const DB_PATH =
  process.env.DOCX_DB_PATH ??
  resolveDefaultPath(
    path.join(STATIC_DIR, 'qpc-v4-tajweed-15-lines.db'),
    path.join(LEGACY_UTILS_DIR, 'qpc-v4-tajweed-15-lines.db'),
  );

// Флаги отладки из аргументов командной строки
const DEBUG = process.argv.includes('--debug') || process.env.DEBUG === '1';
const TEST_PAGE = process.argv.find(arg => arg.startsWith('--page='))?.split('=')[1];
const VERBOSE = process.argv.includes('--verbose') || DEBUG;

/**
 * Отладочный вывод
 */
function debugLog(...args) {
  if (DEBUG || VERBOSE) {
    console.log('[DEBUG]', ...args);
  }
}

/**
 * Извлекает символы из текста с учетом пробелов и переносов строк
 * Пробелы будут добавляться к предыдущему символу в процессе обработки
 */
function extractCharsFromText(text) {
  //console.log(`text: ${text}`);
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace('\n\n', '\n');
  const chars = [];
  let i = 0;
  let line = 1;
  let isLastNewline = false;
  while (i < normalized.length) {
    const symbol = normalized[i];
    if (symbol === '\n') {
      // Если \n повторяется подряд, пропускаем его.
      if (isLastNewline) {
        i++;
        continue;
      }
      chars.push({ symbol: '\n', isNewline: true, isSpace: false, line });
      line++;
      isLastNewline = true;
      i++;
    } else if (symbol === ' ') {
      chars.push({ symbol: ' ', isSpace: true, isNewline: false, line: line });
      isLastNewline = false;
      i++;
    } else {
      chars.push({ symbol, isSpace: false, isNewline: false, line: line });
      isLastNewline = false;
      i++;
    }
  }
  
  //console.log(`chars: ${JSON.stringify(chars)}`);
  return chars;
}

/**
 * Выполняет SQL запрос с промисом
 */
function dbAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Обрабатывает страницу с использованием данных из БД
 */
async function processPageWithDB(pageId, db) {
  let mammoth;
  try {
    mammoth = require('mammoth');
  } catch (e) {
    console.error('Ошибка: установите mammoth: npm install mammoth');
    process.exit(1);
  }

  // Читаем .docx файл
  const docxPath = path.join(PAGES_DIR, `${pageId}.docx`);
  if (!fs.existsSync(docxPath)) {
    throw new Error(`Файл ${docxPath} не найден`);
  }

  const buffer = fs.readFileSync(docxPath);
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value || '';
  
  // Извлекаем все символы из текста
  const textChars = extractCharsFromText(text);
  
  // Получаем данные из БД для этой страницы
  const dbRows = await dbAll(db, `
    SELECT * FROM pages 
    WHERE page_number = ? 
    ORDER BY line_number
  `, [pageId]);
  
  if (dbRows.length === 0) {
    throw new Error(`Нет данных в БД для страницы ${pageId}`);
  }
  
  const data = [];
  let position = 0;
  let index = 0;
  let textCharIndex = 0; // индекс текущего символа из docx файла
  let prevLineType = null; // предыдущий тип строки
  let surahNumberNow = 0;
  
  debugLog(`Начало обработки страницы ${pageId}, записей в БД: ${dbRows.length}, символов в тексте: ${textChars.length}`);
  
  for (let i = 0; i < dbRows.length; i++) {
    const dbRow = dbRows[i];
    const lineType = dbRow.line_type;
    const lineNumber = i + 1;
    const surahNumber = dbRow.surah_number || 0;
    const dbAyahNumber = dbRow.ayah_number || 0;
    const firstWordId = dbRow.first_word_id || 0;
    const lastWordId = dbRow.last_word_id || 0;
    console.log(`lineNumber: ${lineNumber}`);
    
    debugLog(`[${i + 1}/${dbRows.length}] lineType: ${lineType}, surah: ${surahNumber}, ayah: ${dbAyahNumber}, firstWordId: ${firstWordId}, lastWordId: ${lastWordId}, charsToRead: ${lastWordId - firstWordId}, line: ${lineNumber}, position: ${position}, index: ${index}`);
    
    if (surahNumber !== 0 && surahNumberNow !== surahNumber) {
      debugLog(`Смена суры: ${surahNumberNow} -> ${surahNumber}, сброс currentAyah до 1`);
      surahNumberNow = surahNumber;
    }
    // Если после ayah идет surah_name, инкрементируем line
    if (lineType === 'surah_name' && prevLineType === 'ayah') {
      debugLog(`Переход от ayah к surah_name, инкрементируем line: ${lineNumber} -> ${lineNumber + 1}`);
      
      position = 0;
    }
    
    if (lineType === 'surah_name') {
      // Добавляем запись для названия суры
      index++;
      position = 1;
      data.push({
        line: lineNumber,
        position,
        index,
        symbol: 'surah_name',
        surah: surahNumberNow,
        ayat: 0
      });
      position = 0;
    } else if (lineType === 'basmallah') {
      // Добавляем запись для басмаллы
      index++;
      position = 1;
      data.push({
        line: lineNumber,
        position,
        index,
        symbol: 'basmallah',
        surah: surahNumberNow,
        ayat: 0
      });
      position = 0;
    } else if (lineType === 'ayah') {
      // Вычисляем количество символов для чтения
      const charsToRead = lastWordId - firstWordId;
      console.log(`charsToRead: ${charsToRead}`);
      // Читаем нужное количество символов из docx файла
      let charsRead = 0;
      let appendSpace = '';
      while (textCharIndex < textChars.length) {
        const charData = textChars[textCharIndex];
        
        if (charData.isNewline) {
          position = 0;
          textCharIndex++;
          break;
        }
        
        // Если это пробел и есть предыдущая запись на той же строке, добавляем пробел к предыдущему символу
        if (charData.isSpace) {
          appendSpace += ' ';
          textCharIndex++;
          continue
        }
        console.log(`charData.symbol: ${charData.symbol}`);
        // Обрабатываем обычный символ
        index++;
        position++;
        
        const symbol = appendSpace + charData.symbol;
        
        // Добавляем новую запись
        const newData = {
          line: lineNumber,
          position,
          index,
          symbol,
          surah: surahNumberNow,
          ayat: 0
        };
        data.push(newData);
        console.log(`newData: ${JSON.stringify(newData)}`);
        
        appendSpace = '';
        textCharIndex++;
        charsRead++;
      }
      
      // После чтения всех символов для этого аята, инкрементируем номер аята
      if (charsRead > 0) {
        debugLog(`Аят завершен: прочитано ${charsRead} из ${charsToRead} символов `);
      } else if (charsToRead > 0) {
        debugLog(`Предупреждение: не удалось прочитать символы для аята (ожидалось ${charsToRead})`);
      }
    } else {
      // Для других типов строк (если есть) - пропускаем или обрабатываем по-другому
      console.warn(`Неизвестный line_type: ${lineType} для страницы ${pageId}`);
    }
    
    // Сохраняем текущий тип для следующей итерации
    prevLineType = lineType;
  }
  
  // Если включена отладка, выводим статистику
  if (DEBUG) {
    const stats = {
      total: data.length,
      surah_names: data.filter(d => d.symbol === 'surah_name').length,
      basmallahs: data.filter(d => d.symbol === 'basmallah').length,
      symbols: data.filter(d => d.symbol !== 'surah_name' && d.symbol !== 'basmallah').length,
      maxLine: Math.max(...data.map(d => d.line)),
      maxAyah: Math.max(...data.map(d => d.ayat || 0))
    };
    console.log('\nСтатистика:', stats);
  }
  
  return data;
}

/**
 * Главная функция
 */
async function main() {
  // Проверяем наличие библиотек
  try {
    require('sqlite3');
  } catch (e) {
    console.error('Ошибка: установите sqlite3: npm install sqlite3');
    process.exit(1);
  }
  
  if (!fs.existsSync(DB_PATH)) {
    console.error(`База данных ${DB_PATH} не найдена.`);
    process.exit(1);
  }
  
  if (!fs.existsSync(PAGES_DIR)) {
    console.error(`Папка с docx не найдена: ${PAGES_DIR}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    console.log('Создана папка:', OUT_DIR);
  }
  
  // Открываем БД
  const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Ошибка открытия БД:', err.message);
      process.exit(1);
    }
  });
  
  try {
    // Получаем список уникальных страниц из БД
    const pageNumbers = await dbAll(db, `
      SELECT DISTINCT page_number 
      FROM pages 
      ORDER BY page_number
    `);
    
    let pageIds;
    if (TEST_PAGE) {
      // Тестируем конкретную страницу
      const testPageId = parseInt(TEST_PAGE);
      if (isNaN(testPageId)) {
        console.error(`Неверный номер страницы: ${TEST_PAGE}`);
        process.exit(1);
      }
      pageIds = [testPageId];
      console.log(`Режим отладки: обрабатывается только страница ${testPageId}\n`);
    } else {
      pageIds = pageNumbers.map(row => row.page_number);
    }
    
    console.log(`Найдено страниц в БД: ${pageIds.length}\n`);
    
    for (const pageId of pageIds) {
      const docxPath = path.join(PAGES_DIR, `${pageId}.docx`);
      
      if (!fs.existsSync(docxPath)) {
        console.warn(`Пропуск страницы ${pageId}: файл ${docxPath} не найден`);
        continue;
      }
      
      try {
        const data = await processPageWithDB(pageId, db);
        const outPath = path.join(OUT_DIR, `${pageId}.json`);
        fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`Страница ${pageId} -> ${outPath} (${data.length} записей)`);
      } catch (err) {
        console.error(`Страница ${pageId}:`, err.message);
      }
    }
    
    console.log('\nГотово.');
  } finally {
    db.close((err) => {
      if (err) {
        console.error('Ошибка закрытия БД:', err.message);
      }
    });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
