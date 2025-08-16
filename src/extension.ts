import * as vscode from 'vscode';
import { ChatViewProvider } from './ChatViewProvider';
export function activate(context: vscode.ExtensionContext) {
  console.log('congratulations, your extension "qwenChatbot" is now active!');

  // Buat instance provider. Perhatikan kita sekarang meneruskan 'context.workspaceState'.
  // Ini adalah kunci untuk penyimpanan permanen.
  const provider = new ChatViewProvider(context.extensionUri, context.workspaceState);

  // Daftarkan view provider utama
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, provider, {
      // Opsi ini memastikan webview tidak dihancurkan saat disembunyikan
      webviewOptions: { retainContextWhenHidden: true },
    })
  );

  // Daftarkan perintah untuk tombol "New Chat"
  // Saat tombol ini diklik, ia akan memanggil metode 'startNewChat' pada provider.
  context.subscriptions.push(
    vscode.commands.registerCommand('codeva.newChat', () => {
      provider.startNewChat();
    })
  );

  // Daftarkan perintah untuk tombol "History"
  // Saat tombol ini diklik, ia akan memanggil metode 'showHistory'.
  context.subscriptions.push(
    vscode.commands.registerCommand('codeva.showHistory', () => {
      provider.showHistory();
    })
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
