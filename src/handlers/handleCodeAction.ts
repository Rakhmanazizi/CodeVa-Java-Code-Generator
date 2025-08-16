// src/handlers/CodeActionHandler.ts

import * as vscode from 'vscode';
import { CodeParser } from '../utils/CodeParser';

/**
 * Menangani aksi terkait kode seperti 'Insert' dan 'Edit'.
 */
export class handleCodeAction {
    /**
     * Metode utama untuk mengeksekusi aksi 'insertCode' atau 'editCode'.
     * @param type Tipe aksi yang akan dilakukan.
     * @param code Teks kode yang akan diproses.
     */
    public static handle(type: 'insertCode' | 'editCode', code: string) {
        const editor = vscode.window.activeTextEditor;

        // Skenario 1: Ada editor aktif dan aksinya adalah 'Insert'
        if (editor && type === 'insertCode') {
            editor.edit((editBuilder) => {
                editBuilder.insert(editor.selection.active, code);
            });
            return; // Selesai
        }

        // Skenario 2: Tidak ada editor aktif atau aksinya adalah 'Edit'
        const className = CodeParser.extractClassName(code);
        const newFileName = className ? `${className}.java` : 'untitled.java';

        // Cek apakah ada folder workspace yang terbuka
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
            // Jika ada, buat file di dalam folder workspace pertama
            const folderUri = workspaceFolders[0].uri;
            const fileUri = vscode.Uri.joinPath(folderUri, newFileName);

            // Gunakan WorkspaceEdit untuk membuat dan mengisi file dalam satu operasi
            const edit = new vscode.WorkspaceEdit();
            // Opsi { ignoreIfExists: true } mencegah error jika file sudah ada
            edit.createFile(fileUri, { ignoreIfExists: true });
            edit.insert(fileUri, new vscode.Position(0, 0), code);

            vscode.workspace.applyEdit(edit).then((success) => {
                if (success) {
                    vscode.window.showTextDocument(fileUri);
                }
            });
        } else {
            // Jika tidak ada folder yang terbuka, gunakan metode 'untitled'
            const newFileUri = vscode.Uri.parse(`untitled:${newFileName}`);
            vscode.workspace.openTextDocument(newFileUri).then((doc) => {
                const edit = new vscode.WorkspaceEdit();
                edit.insert(newFileUri, new vscode.Position(0, 0), code);
                return vscode.workspace.applyEdit(edit).then((success) => {
                    if (success) {
                        vscode.window.showTextDocument(doc);
                        // Beri tahu pengguna mengapa file tidak disimpan secara otomatis
                        vscode.window.showInformationMessage(`File baru dibuat di memori. Buka sebuah folder untuk menyimpan file secara otomatis.`);
                    }
                });
            });
        }
    }
}
