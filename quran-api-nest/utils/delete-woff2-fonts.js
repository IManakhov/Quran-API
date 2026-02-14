/**
 * Удаляет все файлы *.woff2 в папке fonts/
 *
 * Запуск: node delete-woff2-fonts.js
 */

const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, 'fonts');

function main() {
  if (!fs.existsSync(FONTS_DIR)) {
    console.log('Папка fonts/ не найдена.');
    return;
  }

  const files = fs.readdirSync(FONTS_DIR)
    .filter((f) => f.endsWith('.woff2'))
    .map((f) => path.join(FONTS_DIR, f));

  if (files.length === 0) {
    console.log('В папке fonts/ нет файлов *.woff2');
    return;
  }

  console.log(`Найдено файлов .woff2: ${files.length}\n`);

  for (const filePath of files) {
    fs.unlinkSync(filePath);
    console.log('Удалён:', path.basename(filePath));
  }

  console.log('\nГотово. Удалено файлов:', files.length);
}

main();
