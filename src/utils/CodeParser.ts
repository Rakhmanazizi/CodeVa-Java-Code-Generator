// src/utils/CodeParser.ts

/**
 * Kelas utilitas untuk menganalisis dan mengekstrak informasi dari string kode.
 */

export class CodeParser {
    /**
     * Mengekstrak nama kelas publik dari sepotong kode Java.
     * @param code Teks kode Java.
     * @returns Nama kelas yang sudah dibersihkan, atau null jika tidak ditemukan.
     */
    public static extractClassName(code: string): string | null {
        const match = code.match(/\bpublic\s+class\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (match && match[1]) {
            return match[1].trim();
        }
        return null;
    }

    /**
     * Melakukan pemeriksaan sintaks sederhana pada kode Java yang dihasilkan.
     * @param code Teks kode Java.
     * @returns `true` jika kode kemungkinan besar valid, `false` jika ada error umum.
     */
    public static isLikelyValidJava(code: string): boolean {
        // Cek jika ada kata kunci yang salah ketik atau aneh
        const commonMistakes = ['ublic', 'voidain', 'tatic', 'lass', 'Strin[]'];
        if (commonMistakes.some((mistake) => code.includes(mistake))) {
            console.log(`[Codeva Validation] Failed: Found common mistake.`);
            return false;
        }

        // Cek keseimbangan kurung kurawal
        const openBraces = (code.match(/{/g) || []).length;
        const closeBraces = (code.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
            console.log(`[Codeva Validation] Failed: Brace mismatch (open: ${openBraces}, close: ${closeBraces}).`);
            return false;
        }

        // Jika lolos semua pemeriksaan, anggap valid
        return true;
    }
}
