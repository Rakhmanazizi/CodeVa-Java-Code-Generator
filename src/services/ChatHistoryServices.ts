// src/services/ChatHistoryService.ts

import * as vscode from 'vscode';

// definisikan tipe data agar konsisten

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
}

export class ChatHistoryService {
    private allSessions: ChatSession[] = [];
    private activeSessionId: string | null = null;

    constructor(private workspaceState: vscode.Memento) {
        /**
         * Muat sesi dari penyimpanan workspace saat inisialisasi.
         */
        this.allSessions = this.workspaceState.get<ChatSession[]>('chatSessions', []);
        if (this.allSessions.length > 0) {
            this.activeSessionId = this.allSessions[this.allSessions.length - 1].id;
        }
    }

    private save() {
        this.workspaceState.update('chatSessions', this.allSessions);
        console.log(`[Codeva] Sessions Saved. Active session (${this.activeSessionId}) now has ${this.getActiveSession()?.messages.length || 0} messages.`);
    }

    public getActiveSession(): ChatSession | undefined {
        if (!this.activeSessionId) {
            return undefined;
        }
        return this.allSessions.find((s) => s.id === this.activeSessionId);
    }

    public getAllSessions(): ChatSession[] {
        return this.allSessions;
    }

    public setActiveSession(sessionId: string) {
        this.activeSessionId = sessionId;
    }

    public startNewSession(): ChatSession {
        const newSessionId = new Date().getTime().toString();
        const newSession: ChatSession = {
            id: newSessionId,
            title: 'New Chat',
            messages: [],
        };
        this.allSessions.push(newSession);
        this.activeSessionId = newSessionId;
        this.save();
        return newSession;
    }

    public addMessage(role: 'user' | 'assistant', content: string): ChatSession {
        let sessionIndex = this.allSessions.findIndex((s) => s.id === this.activeSessionId);

        if (sessionIndex === -1) {
            const newSession = this.startNewSession();
            sessionIndex = this.allSessions.length - 1;
            newSession.title = content.substring(0, 40) + (content.length > 40 ? '...' : '');
        } else if (this.allSessions[sessionIndex].messages.length === 0 && role === 'user') {
            this.allSessions[sessionIndex].title = content.substring(0, 40) + (content.length > 40 ? '...' : '');
        }

        this.allSessions[sessionIndex].messages.push({ role, content });
        this.save();
        return this.allSessions[sessionIndex];
    }

    public deleteSession(sessionId: string): ChatSession | undefined {
        this.allSessions = this.allSessions.filter((s) => s.id !== sessionId);

        if (this.activeSessionId === sessionId) {
            if (this.allSessions.length > 0) {
                this.activeSessionId = this.allSessions[this.allSessions.length - 1].id;
            } else {
                this.activeSessionId = null;
            }
        }
        this.save();
        return this.getActiveSession();
    }
}
