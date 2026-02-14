/**
 * Временный скрипт для просмотра структуры БД
 */

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'qpc-v4-tajweed-15-lines.db');

try {
  const db = new Database(DB_PATH, { readonly: true });
  
  // Получаем структуру таблицы pages
  const schema = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='pages'").get();
  console.log('Схема таблицы pages:');
  console.log(schema.sql);
  console.log('\n');
  
  // Получаем примеры записей для страницы 1
  const rows = db.prepare("SELECT * FROM pages WHERE page_number = 1 ORDER BY line_number, position LIMIT 20").all();
  console.log('Примеры записей для page_number = 1:');
  console.log(JSON.stringify(rows, null, 2));
  console.log('\n');
  
  // Получаем уникальные line_type
  const lineTypes = db.prepare("SELECT DISTINCT line_type FROM pages").all();
  console.log('Уникальные line_type:');
  console.log(JSON.stringify(lineTypes, null, 2));
  
  db.close();
} catch (err) {
  console.error('Ошибка:', err.message);
  console.log('\nУстановите better-sqlite3: npm install better-sqlite3');
}
