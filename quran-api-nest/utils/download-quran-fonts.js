/**
 * Скрипт загрузки шрифтов Корана (Uthmanic) с understandquran.com
 * Загружает файлы QCF4001_COLOR-Regular.woff2 ... QCF4604_COLOR-Regular.woff2 в папку fonts/
 *
 * Запуск: node download-quran-fonts.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, 'fonts');
const BASE_URL = 'https://understandquran.com/quran/uthmanic/';
const START = 1;
const END = 604;
const DELAY_MS = 200; // задержка между запросами, чтобы не перегружать сервер

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const filename = path.basename(new URL(url).pathname);
    const filepath = path.join(FONTS_DIR, filename);

    const request = protocol.get(url, { timeout: 30000 }, (response) => {
      // следовать редиректам
      if (response.statusCode >= 301 && response.statusCode <= 302 && response.headers.location) {
        return downloadFile(response.headers.location).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(filepath);
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });

    request.on('error', (err) => {
      reject(err);
    });
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (!fs.existsSync(FONTS_DIR)) {
    fs.mkdirSync(FONTS_DIR, { recursive: true });
    console.log('Создана папка:', FONTS_DIR);
  }

  console.log(`Загрузка шрифтов ${START}–${END} в ${FONTS_DIR}\n`);

  let ok = 0;
  let fail = 0;

  for (let i = START; i <= END; i++) {
    const iter = i.toString().padStart(3, '0');
    const filename = `QCF4${iter}_COLOR-Regular.woff2`;
    const url = `${BASE_URL}${filename}`;

    process.stdout.write(`[${i}/${END}] ${filename} ... `);

    try {
      await downloadFile(url);
      ok++;
      console.log('OK');
    } catch (err) {
      fail++;
      console.log('FAIL:', err.message);
    }

    if (i < END) {
      await sleep(DELAY_MS);
    }
  }

  console.log('\nГотово. Успешно:', ok, 'Ошибок:', fail);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
