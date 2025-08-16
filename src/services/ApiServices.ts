// src/services/ApiService.ts

import axios from 'axios';
import { ChatMessage } from './ChatHistoryServices'; // Pastikan tipe ini diekspor

/**
 * Menangani semua komunikasi dengan API kustom Anda.
 */
export class ApiService {
    constructor() {}

    /**
     * PERUBAHAN: Memformat SELURUH riwayat percakapan menjadi satu string prompt.
     * @param messages Array berisi seluruh pesan dalam sesi saat ini.
     * @returns String prompt yang sudah diformat lengkap untuk dikirim ke API.
     */
    private formatHistoryForModel(messages: ChatMessage[]): string {
        // Template untuk setiap bagian percakapan
        const systemPrompt = `<|im_start|>system\nYou are CodeVa, a helpful AI assistant specialized in Java code generation.<|im_end|>\n`;

        // Gabungkan semua pesan pengguna dan asisten
        const conversation = messages
            .map((msg) => {
                return `<|im_start|>${msg.role}\n${msg.content}<|im_end|>`;
            })
            .join('\n');

        // Tambahkan awalan untuk respons asisten di akhir
        const finalPrompt = systemPrompt + conversation + '\n<|im_start|>assistant\n';

        return finalPrompt;
    }

    /**
     * Memulai streaming dari API Ngrok.
     * @param apiUrl URL lengkap ke endpoint Ngrok Anda.
     * @param userPrompt Prompt mentah dari pengguna.
     * @param callbacks Objek berisi fungsi untuk menangani data, akhir stream, dan error.
     */
    public async streamFromCustomApi(apiUrl: string, messages: ChatMessage[], callbacks: { onData: (chunk: string) => void; onEnd: (fullResponse: string) => void; onError: (err: Error) => void }) {
        // 1. Format prompt sesuai dengan kebutuhan model fine-tuned Anda.
        const fullPromptForModel = this.formatHistoryForModel(messages);

        let fullResponse = '';

        try {
            // 2. Panggil API Anda dengan body yang sesuai.
            // Server Anda mengharapkan kunci "instruction", bukan "inputs" atau "prompt".


            const response = await axios.post(
                apiUrl,
                {
                    instruction: fullPromptForModel,
                    max_new_tokens: 2048,
                    stream: true,
                },
                { responseType: 'stream' }
            );

            // 3. Proses stream teks mentah yang masuk dari server Anda.

            response.data.on('data', (chunk: Buffer) => {
                const delta = chunk.toString();
                if (delta) {
                    fullResponse += delta;
                    callbacks.onData(delta);
                }
            });

            response.data.on('end', () => {
                callbacks.onEnd(fullResponse);
            });
            
        } catch (error) {
            callbacks.onError(error as Error);
        }
    }
}
