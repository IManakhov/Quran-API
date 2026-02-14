/**
 * Переименовывает файлы шрифтов Корана:
 * QCF4001_COLOR-Regular.woff2 -> qcf4_p001.woff2
 * QCF4002_COLOR-Regular.woff2 -> qcf4_p002.woff2
 * ...
 *
 * Запуск: node rename-quran-fonts.js
 */

const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, 'fonts');

const pattern = /^QCF4(\d{3})_COLOR-Regular\.woff2$/;

function main() {
  if (!fs.existsSync(FONTS_DIR)) {
    console.error('Папка fonts/ не найдена. Сначала запустите: node download-quran-fonts.js');
    process.exit(1);
  }

  const files = fs.readdirSync(FONTS_DIR);
  let renamed = 0;
  let skipped = 0;

  for (const file of files) {
    const match = file.match(pattern);
    if (!match) {
      skipped++;
      continue;
    }

    const num = match[1]; // 001, 002, ...
    const newName = `qcf4_p${num}.woff2`;
    const oldPath = path.join(FONTS_DIR, file);
    const newPath = path.join(FONTS_DIR, newName);

    if (oldPath === newPath) {
      skipped++;
      continue;
    }

    if (fs.existsSync(newPath)) {
      console.warn('Пропуск (уже существует):', newName);
      skipped++;
      continue;
    }

    fs.renameSync(oldPath, newPath);
    console.log(file, '->', newName);
    renamed++;
  }

  console.log('\nПереименовано:', renamed, 'Пропущено:', skipped);
}

main();
