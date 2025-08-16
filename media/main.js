// media/main.js

(function () {
    const vscode = acquireVsCodeApi();
    const chatContainer = document.getElementById('chat-container');
    const promptInput = document.getElementById('prompt-input');
    const sendButton = document.getElementById('send-button');

    let currentBotMessageElement = null;
    let currentBotContent = '';
    let isWelcomeScreenVisible = false;

    // FUNGSI BARU: Menampilkan Halaman Sambutan
    function showWelcomeScreen() {
        chatContainer.innerHTML = ''; // Kosongkan container
        const welcomeDiv = document.createElement('div');
        welcomeDiv.className = 'welcome-container';
        welcomeDiv.innerHTML = `
            <h1>CodeVa</h1>
            <p>Is your AI-powered Java Coding Assitant</p>
            <p class="powered-by">This Copilot is powered by Fine-Tuned<br/>Qwen2.5-Instruct Model</p>
        `;
        chatContainer.appendChild(welcomeDiv);
        isWelcomeScreenVisible = true;
    }

    function addMessage(sender, text) {
        if (isWelcomeScreenVisible) {
            chatContainer.innerHTML = '';
            isWelcomeScreenVisible = false;
        }
        const messageElement = document.createElement('div');
        messageElement.className = `chat-message ${sender === 'user' ? 'user-message' : 'bot-message'}`;
        messageElement.innerHTML = text;
        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
        return messageElement;
    }

    function enhanceCodeBlocks(element) {
        // Cari semua elemen <code> di dalam <pre> yang ada di dalam pesan bot
        element.querySelectorAll('pre code').forEach((block) => {
            // terapkan syntax highlighting
            hljs.highlightElement(block);

            // 1. Tambahkan kelas untuk styling
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block-wrapper';

            // Pastikan elemen induknya adalah <pre> sebelum menggantinya
            if (block.parentElement && block.parentElement.tagName === 'PRE') {
                block.parentElement.replaceWith(wrapper);
                wrapper.appendChild(block.parentElement);
            }

            // 3. Buat container untuk tombol-tombol
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'code-actions';

            // Ambil teks mentah dari blok kode untuk di-copy atau di-insert
            const codeText = block.textContent;

            // 4. Buat Tombol Copy dengan Ikon
            const copyButton = document.createElement('button');
            copyButton.innerHTML = `<i class="codicon codicon-copy"></i>`;
            copyButton.title = 'Copy Code';
            copyButton.onclick = () => {
                navigator.clipboard.writeText(codeText);
                copyButton.innerHTML = `<i class="codicon codicon-check"></i>`; // Ganti ikon menjadi centang
                setTimeout(() => {
                    copyButton.innerHTML = `<i class="codicon codicon-copy"></i>`; // Kembalikan ikon setelah 2 detik
                }, 2000);
            };

            // 5. Buat Tombol Insert dengan Ikon
            const insertButton = document.createElement('button');
            insertButton.innerHTML = `<i class="codicon codicon-insert"></i>`;
            insertButton.title = 'Insert to Editor';
            insertButton.onclick = () => {
                vscode.postMessage({ type: 'insertCode', value: codeText });
            };

            // 6. Buat Tombol Edit dengan Ikon
            const editButton = document.createElement('button');
            editButton.innerHTML = `<i class="codicon codicon-edit"></i>`;
            editButton.title = 'Edit Code';
            editButton.onclick = () => {
                vscode.postMessage({ type: 'editCode', value: codeText });
            };

            // 7. Masukkan semua tombol ke dalam container tombol
            buttonContainer.appendChild(copyButton);
            buttonContainer.appendChild(insertButton);
            buttonContainer.appendChild(editButton);

            // 8. Masukkan container tombol ke dalam div pembungkus utama
            wrapper.appendChild(buttonContainer);
        });
    }

    function handleSend() {
        const question = promptInput.value;
        if (question && question.trim() !== '') {
            addMessage('user', question);
            vscode.postMessage({ type: 'askQuestion', value: question });
            promptInput.value = '';
        }
    }

    sendButton.innerHTML = `<i class="codicon codicon-send"></i>`;
    sendButton.addEventListener('click', handleSend);
    promptInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    });

    window.addEventListener('message', (event) => {
        const message = event.data;
        switch (message.type) {
            case 'showWelcomeScreen':
                showWelcomeScreen();
                break;
            case 'restoreHistory':
                const history = message.history;
                chatContainer.innerHTML = '';
                if (history) {
                    history.forEach((item) => {
                        if (item.role === 'user') {
                            addMessage('user', item.content);
                        } else if (item.role === 'assistant') {
                            const botMessageElement = addMessage('bot', '');
                            botMessageElement.innerHTML = marked.parse(item.content);
                            enhanceCodeBlocks(botMessageElement);
                        }
                    });
                }
                chatContainer.scrollTop = chatContainer.scrollHeight;
                break;

            // --- TAMBAHAN BARU DI SINI ---
            case 'addFinalResponse':
                // Tambahkan pesan penolakan sebagai pesan bot biasa
                addMessage('bot', message.value);
                break;
            // -----------------------------

            case 'startStreamingResponse':
                currentBotContent = '';
                currentBotMessageElement = addMessage('bot', '');
                currentBotMessageElement.innerHTML = `<div class="loading-dots"><span></span><span></span><span></span></div>`;
                break;

            case 'finalizeResponse':
                const loadingElement = chatContainer.querySelector('.loading');
                if (loadingElement) {
                    loadingElement.classList.remove('loading');
                    loadingElement.innerHTML = marked.parse(message.value);
                    enhanceCodeBlocks(loadingElement);
                }
                promptInput.disabled = false;
                sendButton.disabled = false;
                promptInput.focus();
                break;

            case 'updateStreamingResponse':
                if (currentBotMessageElement) {
                    currentBotContent += message.value;
                    currentBotMessageElement.innerHTML = marked.parse(currentBotContent);
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
                break;

            case 'endStreamingResponse':
                if (currentBotMessageElement) {
                    enhanceCodeBlocks(currentBotMessageElement);
                }
                currentBotMessageElement = null;
                break;

            case 'showError':
                if (currentBotMessageElement) {
                    currentBotMessageElement.innerHTML = `<p style="color: var(--vscode-errorForeground);">${message.value}</p>`;
                } else {
                    addMessage('bot', `<p style="color: var(--vscode-errorForeground);">${message.value}</p>`);
                }
                break;
        }
    });

    // 1. Perbaikan Logika: Kirim sinyal bahwa webview sudah siap.
    vscode.postMessage({ type: 'webviewReady' });
})();
