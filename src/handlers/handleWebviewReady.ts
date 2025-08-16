// src/handlers/handleWebviewReady.ts

import { ChatViewProvider } from '../ChatViewProvider';

/**
 * menangani event saat webview siap,
 * menampilkan welcome screen
 * memulihkan riwayat chat
 */
export class handleWebviewReady {
    public static handle(provider: ChatViewProvider) {
        const activeSession = provider.historyService.getActiveSession();
        if (!activeSession || activeSession.messages.length === 0) {
            provider.postMessageToWebview({ type: 'showWelcomeScreen' });
        } else {
            provider.postMessageToWebview({ type: 'restoreHistory', history: activeSession.messages });
        }
    }
}
