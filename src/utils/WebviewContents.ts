// src/utils/WebviewContent.ts

import * as vscode from 'vscode';
import { Security } from './Security';

/**
 * Kelas yang bertanggung jawab untuk menghasilkan konten HTML untuk webview
 */

export class WebviewContent {
  /**
   * Menghasilkan konten HTML lengkap untuk panel chat.
   * @param webview Objek webview saat ini.
   * @param extensionUri URI ke root ekstensi untuk memuat resource lokal.
   * @returns String HTML.
   */

  public static getHtml(webview: vscode.Webview, extensionUri: vscode.Uri): string {
    // Jalur ke resource lokal
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'main.js'));
    const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'styles.css'));
    const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'codicon.css'));

    // Jalur ke resource eksternal (CDN)
    const markedJsUri = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    const highlightJsUri = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    const highlightCssUri = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/vs2015.min.css';
    const googleFontsUri = 'https://fonts.googleapis.com';

    const nonce = Security.getNonce(); // Gunakan metode dari kelas Security

    return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="
                    default-src 'none';
                    style-src ${webview.cspSource} https://fonts.googleapis.com https://cdnjs.cloudflare.com;
                    font-src ${webview.cspSource} https://fonts.gstatic.com;
                    script-src 'nonce-${nonce}' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com;
                ">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="${googleFontsUri}/css2?family=JetBrains+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
                <link href="${highlightCssUri}" rel="stylesheet">
                <link href="${codiconsUri}" rel="stylesheet" />
                <link href="${stylesUri}" rel="stylesheet">
                <title>Codeva: Java Coding Assistant</title>
            </head>
            <body>
                <div class="app-container">
                    <div id="chat-container"></div>
                    <div class="input-container">
                        <div class="input-wrapper">
                            <textarea id="prompt-input" placeholder="Ask Codeva to generate Java Code..."></textarea>
                            <button id="send-button"></button>
                        </div>
                    </div>
                </div>
                <script nonce="${nonce}" src="${markedJsUri}"></script>
                <script nonce="${nonce}" src="${highlightJsUri}"></script>
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
  }
}
