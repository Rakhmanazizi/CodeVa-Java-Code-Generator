// src/ChatViewProvider.ts (Refactored)

import * as vscode from 'vscode';
import { WebviewContent } from './utils/WebviewContents';
import { ChatHistoryService } from './services/ChatHistoryServices';
import { ApiService } from './services/ApiServices';
import { handleWebviewReady } from './handlers/handleWebviewReady';
import { handleAskQuestion } from './handlers/handleAskQuestion';
import { handleCodeAction } from './handlers/handleCodeAction';

/**
 * Mengelola state dan logika untuk panel webview chat.
 * Kelas ini bertanggung jawab sebagai controller yang menhubungkan UI (webview) dengan logika bisnis (chat history, API calls, dll).
 */
export class ChatViewProvider implements vscode.WebviewViewProvider {
    /**
     * ID unik yang mengidentifikasi tipe view ini. Harus cocok dengan yang ada di package.json.
     */
    public static readonly viewType = 'qwenChatbot.view';
    private _view?: vscode.WebviewView;

    // Instance dari services
    public readonly historyService: ChatHistoryService;
    public readonly apiService: ApiService;

    constructor(private readonly _extensionUri: vscode.Uri, private readonly _workspaceState: vscode.Memento) {
        // inisialisasi service saat provider dibuat
        this.historyService = new ChatHistoryService(this._workspaceState);
        this.apiService = new ApiService();
    }

    // --- METODE UTAMA ---
    public resolveWebviewView(webviewView: vscode.WebviewView /*...*/) {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri, vscode.Uri.joinPath(this._extensionUri, 'node_modules', '@vscode/codicons', 'dist')],
        };
        webviewView.webview.html = WebviewContent.getHtml(webviewView.webview, this._extensionUri);

        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'webviewReady':
                    handleWebviewReady.handle(this);
                    break;
                case 'askQuestion':
                    await handleAskQuestion.handle(this, data.value);
                    break;
                case 'insertCode':
                case 'editCode':
                    handleCodeAction.handle(data.type, data.value);
                    break;
            }
        });
    }

    /**
     * Dipanggil oleh command 'codeva.newChat'.
     * Memulai sesi chat baru.
     */
    public startNewChat() {
        this.historyService.startNewSession();
        this._view?.webview.postMessage({ type: 'showWelcomeScreen' });
    }

    /**
     * Dipanggil oleh command 'codeva.showHistory'.
     * Menampilkan daftar riwayat chat kepada pengguna.
     */
    public async showHistory() {
        const allSessions = this.historyService.getAllSessions();
        if (allSessions.length === 0) {
            vscode.window.showInformationMessage('Tidak ada riwayat percakapan.');
            return;
        }

        const quickPick = vscode.window.createQuickPick();
        quickPick.placeholder = 'Pilih percakapan untuk dilanjutkan atau hapus';
        quickPick.items = allSessions
            .map((session) => ({
                label: session.title,
                description: `ID: ${session.id}`,
                detail: `${session.messages.length} pesan`,
                buttons: [{ iconPath: new vscode.ThemeIcon('trash'), tooltip: 'Hapus Sesi' }],
            }))
            .reverse();

        quickPick.onDidAccept(() => {
            const selectedItem = quickPick.selectedItems[0];
            if (selectedItem && selectedItem.description) {
                const sessionId = selectedItem.description.replace('ID: ', '');
                this.historyService.setActiveSession(sessionId);
                const session = this.historyService.getActiveSession();
                if (session) {
                    this._view?.webview.postMessage({ type: 'restoreHistory', history: session.messages });
                }
            }
            quickPick.hide();
        });

        quickPick.onDidTriggerItemButton((e) => {
            if (e.button.tooltip === 'Hapus Sesi' && e.item.description) {
                const sessionIdToDelete = e.item.description.replace('ID: ', '');
                vscode.window.showWarningMessage(`Hapus percakapan "${e.item.label}"?`, { modal: true }, 'Hapus').then((selection) => {
                    if (selection === 'Hapus') {
                        const newActiveSession = this.historyService.deleteSession(sessionIdToDelete);
                        if (newActiveSession && newActiveSession.messages.length > 0) {
                            this._view?.webview.postMessage({ type: 'restoreHistory', history: newActiveSession.messages });
                        } else {
                            this._view?.webview.postMessage({ type: 'showWelcomeScreen' });
                        }
                        quickPick.hide();
                    }
                });
            }
        });

        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
    }

    /**
     * Metode publik untuk mengirim pesan ke webview dari mana saja (termasuk handler).
     * @param message Objek pesan yang akan dikirim.
     */
    public postMessageToWebview(message: any) {
        this._view?.webview.postMessage(message);
    }
}
