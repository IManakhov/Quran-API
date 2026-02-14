/**
 * Конвертирует все файлы *.woff2 в папке fonts/ в *.ttf
 * Требует: npm install wawoff2 (в корне проекта)
 *
 * Запуск: node convert-woff2-to-ttf.js
 */

const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, 'fonts');

function getWoff2Files(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.woff2'))
    .map((f) => path.join(dir, f));
}

async function main() {
  let wawoff2;
  try {
    wawoff2 = require('wawoff2');
  } catch (e) {
    console.error('Ошибка: пакет wawoff2 не найден.');
    console.error('Выполните в корне проекта: npm install wawoff2');
    process.exit(1);
  }

  if (!fs.existsSync(FONTS_DIR)) {
    console.error('Папка fonts/ не найдена. Сначала запустите: node download-quran-fonts.js');
    process.exit(1);
  }

  const files = getWoff2Files(FONTS_DIR);
  if (files.length === 0) {
    console.log('В папке fonts/ нет файлов *.woff2');
    return;
  }

  console.log(`Найдено файлов .woff2: ${files.length}\n`);

  let ok = 0;
  let fail = 0;

  for (const filePath of files) {
    const basename = path.basename(filePath);
    const outPath = filePath.replace(/\.woff2$/i, '.ttf');

    process.stdout.write(`${basename} -> ${path.basename(outPath)} ... `);

    try {
      const src = fs.readFileSync(filePath);
      const decoded = await wawoff2.decompress(src);
      const outBuffer = Buffer.isBuffer(decoded) ? decoded : Buffer.from(decoded);
      fs.writeFileSync(outPath, outBuffer);
      ok++;
      console.log('OK');
    } catch (err) {
      fail++;
      console.log('FAIL:', err.message);
    }
  }

  console.log('\nГотово. Успешно:', ok, 'Ошибок:', fail);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
