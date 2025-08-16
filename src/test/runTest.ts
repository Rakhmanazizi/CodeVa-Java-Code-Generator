// src/test/runTest.ts

import * as path from 'path';
import { runTests } from '@vscode/test-electron';

async function main() {
  try {
    // Path ke direktori ekstensi saat ini
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // Path ke file entry point untuk menjalankan tes (index.js)
    const extensionTestsPath = path.resolve(__dirname, './index');

    // Unduh VS Code, unzip, dan jalankan tes integrasi
    await runTests({ extensionDevelopmentPath, extensionTestsPath });
  } catch (err) {
    console.error('Failed to run tests');
    process.exit(1);
  }
}

main();
