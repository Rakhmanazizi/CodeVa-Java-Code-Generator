// src/utils/Security.ts

/**
 * Kelas utilitas untuk function terkait keamanan.
 */

export class Security {
  /**
   * Menghasilkan string acak untuk digunakan sebagai nonce dalam content security policy.
   * @returns String nonce acak.
   */

  public static getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
  }
}
