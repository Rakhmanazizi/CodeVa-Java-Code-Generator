// copy-assets.js

const fs = require('fs-extra');
const path = require('path');

// Daftar aset yang perlu kita salin dari node_modules ke folder media
const assetsToCopy = [
  {
    from: 'node_modules/@vscode/codicons/dist/codicon.css',
    to: 'media/codicon.css',
  },
  {
    from: 'node_modules/@vscode/codicons/dist/codicon.ttf',
    to: 'media/codicon.ttf',
  },
];

async function copyAssets() {
  console.log('Copying required assets...');
  try {
    for (const asset of assetsToCopy) {
      const sourcePath = path.resolve(__dirname, asset.from);
      const destPath = path.resolve(__dirname, asset.to);
      // Salin file dari sumber ke tujuan
      await fs.copy(sourcePath, destPath);
      console.log(`  -> Copied ${asset.from} to ${asset.to}`);
    }
    console.log('Assets copied successfully!');
  } catch (err) {
    console.error('Error copying assets:', err);
    process.exit(1); // Hentikan proses jika gagal
  }
}

// Jalankan fungsi
copyAssets();
