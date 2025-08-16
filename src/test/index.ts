// src/test/index.ts

import * as path from 'path';
import { glob } from 'glob';

// Impor Mocha menggunakan sintaks yang benar untuk modul CommonJS
import Mocha = require('mocha');

export function run(): Promise<void> {
  // Buat instance Mocha baru untuk pengujian
  const mocha = new Mocha({
    ui: 'bdd', // Gunakan antarmuka 'bdd' yang menyediakan 'describe()' dan 'it()'
    color: true,
    timeout: 10000, // Beri waktu 10 detik sebelum timeout
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((resolve, reject) => {
    // Gunakan glob untuk menemukan semua file tes secara rekursif
    glob('**/**.test.js', { cwd: testsRoot })
      .then((files) => {
        // Tambahkan setiap file tes yang ditemukan ke dalam Mocha
        files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          // Jalankan tes Mocha
          mocha.run((failures) => {
            if (failures > 0) {
              // Jika ada tes yang gagal, tolak promise-nya
              reject(new Error(`${failures} tests failed.`));
            } else {
              // Jika semua tes berhasil, selesaikan promise-nya
              resolve();
            }
          });
        } catch (err) {
          console.error(err);
          reject(err);
        }
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}
