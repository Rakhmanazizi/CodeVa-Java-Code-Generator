// src/handler/handleAskQuestion.ts

import { ChatViewProvider } from '../ChatViewProvider';
import * as vscode from 'vscode';

export class handleAskQuestion {
    /**
     * Memeriksa instruksi pengguna untuk bahasa non-Java sebelum mengirim ke API.
     * @param instruction Teks prompt dari pengguna.
     * @returns Pesan penolakan jika tidak valid, atau `null` jika valid.
     */
    private checkInstructionBeforeSending(instruction: string): string | null {
        const forbiddenLanguages = ['python', 'javascript', 'c#', 'c++', 'c language', 'typescript', 'php', 'ruby', 'golang', 'lisp', 'bash'];
        const instructionLower = instruction.toLowerCase();

        for (const lang of forbiddenLanguages) {
            if (instructionLower.includes(lang)) {
                // Jika ditemukan bahasa terlarang, kembalikan pesan penolakan
                return `Maaf, saya adalah CodeVa yang berspesialisasi dalam Code Generator Java. Saya tidak bisa membuat kode dalam bahasa ${lang}.`;
            }
        }

        // Jika tidak ada masalah, kembalikan null
        return null;
    }

    /**
     * Metode utama untuk mengeksekusi aksi 'askQuestion'.
     * @param provider Instance dari ChatViewProvider untuk mengakses services dan webview.
     * @param prompt Teks prompt yang dikirim oleh pengguna.
     */
    public static async handle(provider: ChatViewProvider, prompt: string) {
        // Menambahkan pesan pengguna ke riwayat sesi melalui historyService
        const session = provider.historyService.addMessage('user', prompt);

        // --- LOGIKA FILTER DIMULAI ---
        const handlerInstance = new handleAskQuestion();
        const rejectionMessage = handlerInstance.checkInstructionBeforeSending(prompt);

        if (rejectionMessage) {
            // Jika ada pesan penolakan, jangan panggil API.
            // Langsung kirim pesan penolakan sebagai jawaban asisten.
            console.log(`[CodeVa] Permintaan ditolak di sisi klien: ${rejectionMessage}`);

            // Tambahkan pesan penolakan ke riwayat chat
            provider.historyService.addMessage('assistant', rejectionMessage);

            // Kirim pesan penolakan ke webview untuk ditampilkan
            provider.postMessageToWebview({ type: 'addFinalResponse', value: rejectionMessage });

            return; // Hentikan eksekusi di sini
        }
        // --- LOGIKA FILTER SELESAI ---

        const apiUrl = 'https://4898ced26dd1.ngrok-free.app/generate-stream';

        // Validasi awal: Pastikan URL API sudah diatur
        if (!apiUrl || apiUrl.includes('YOUR_NGROK_URL_HERE')) {
            provider.postMessageToWebview({ type: 'showError', value: 'URL API Ngrok belum diatur di Pengaturan.' });
            return;
        }

        // Beri tahu UI untuk menampilkan animasi loading
        provider.postMessageToWebview({ type: 'startStreamingResponse' });

        // Panggil metode "gatekeeper" utama dari ApiService
        await provider.apiService.streamFromCustomApi(apiUrl, session.messages, {
            onData: (delta) => {
                // Kirim setiap potongan data ke UI untuk efek streaming
                provider.postMessageToWebview({ type: 'updateStreamingResponse', value: delta });
            },
            onEnd: (fullResponse) => {
                // Setelah stream selesai, simpan respons penuh dari asisten ke riwayat
                provider.historyService.addMessage('assistant', fullResponse);
                // Beri tahu UI bahwa stream telah selesai
                provider.postMessageToWebview({ type: 'endStreamingResponse' });
            },
            onError: (err) => {
                // Tangani jika terjadi error saat memanggil API
                console.error('API Error:', err);
                provider.postMessageToWebview({ type: 'showError', value: 'Gagal menghubungi API Anda. Pastikan Kaggle/Ngrok berjalan.' });
            },
        });
    }
}
