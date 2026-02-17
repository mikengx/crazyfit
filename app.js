class AIProxyPWA {
    constructor() {
        this.messages = [];
        this.config = this.loadConfig();
        this.stubResponses = this.initStubResponses();
        this.initElements();
        this.bindEvents();
        this.registerServiceWorker();
        this.updateUI();

        console.log('AI Proxy PWA initialized successfully');
    }

    initElements() {
        this.settingsBtn = document.getElementById('settings-btn');
        this.settings = document.getElementById('settings');
        this.apiUrlInput = document.getElementById('api-url');
        this.apiKeyInput = document.getElementById('api-key');
        this.modelInput = document.getElementById('model');
        this.saveSettingsBtn = document.getElementById('save-settings');
        this.chat = document.getElementById('chat');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.loading = document.getElementById('loading');

        // Check if all elements exist
        const elements = {
            settingsBtn: this.settingsBtn,
            settings: this.settings,
            apiUrlInput: this.apiUrlInput,
            apiKeyInput: this.apiKeyInput,
            modelInput: this.modelInput,
            saveSettingsBtn: this.saveSettingsBtn,
            chat: this.chat,
            messageInput: this.messageInput,
            sendBtn: this.sendBtn,
            loading: this.loading
        };

        for (const [name, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`Element not found: ${name}`);
            }
        }
    }

    bindEvents() {
        if (this.settingsBtn) {
            this.settingsBtn.addEventListener('click', () => this.toggleSettings());
        }

        if (this.saveSettingsBtn) {
            this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
        }

        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => {
                console.log('Send button clicked');
                this.sendMessage();
            });
        }

        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('Enter key pressed');
                    this.sendMessage();
                }
            });
        }
    }

    loadConfig() {
        try {
            const saved = localStorage.getItem('ai-proxy-config');
            return saved ? JSON.parse(saved) : {
                apiUrl: 'https://api.openai.com/v1/chat/completions',
                apiKey: '',
                model: 'gpt-3.5-turbo',
                useStub: true
            };
        } catch (error) {
            console.error('Error loading config:', error);
            return {
                apiUrl: 'https://api.openai.com/v1/chat/completions',
                apiKey: '',
                model: 'gpt-3.5-turbo',
                useStub: true
            };
        }
    }

    saveConfig() {
        try {
            localStorage.setItem('ai-proxy-config', JSON.stringify(this.config));
        } catch (error) {
            console.error('Error saving config:', error);
        }
    }

    updateUI() {
        if (this.apiUrlInput) this.apiUrlInput.value = this.config.apiUrl;
        if (this.apiKeyInput) this.apiKeyInput.value = this.config.apiKey;

        if (this.modelInput) this.modelInput.value = this.config.model;

        const canSend = this.config.useStub || this.config.apiKey.trim() !== '';

        if (this.messageInput) {
            this.messageInput.disabled = !canSend;
            this.messageInput.placeholder = this.config.useStub ?
                'Type your message (using stub AI)...' :
                'Type your message...';
        }

        if (this.sendBtn) {
            this.sendBtn.disabled = !canSend;
        }
    }

    toggleSettings() {
        if (this.settings) {
            this.settings.classList.toggle('hidden');
        }
    }

    saveSettings() {
        this.config = {
            apiUrl: this.apiUrlInput ? this.apiUrlInput.value.trim() : this.config.apiUrl,
            apiKey: this.apiKeyInput ? this.apiKeyInput.value.trim() : this.config.apiKey,
            model: this.modelInput ? this.modelInput.value.trim() : this.config.model,
            useStub: this.config.apiKey.trim() === '' ? true : this.config.useStub
        };
        this.saveConfig();
        this.updateUI();
        if (this.settings) {
            this.settings.classList.add('hidden');
        }
    }

    addMessage(role, content) {
        const message = { role, content };
        this.messages.push(message);

        const messageEl = document.createElement('div');
        messageEl.className = `message ${role}`;
        messageEl.textContent = content;

        if (this.chat) {
            this.chat.appendChild(messageEl);
            this.chat.scrollTop = this.chat.scrollHeight;
        }

        console.log(`Added ${role} message:`, content);
    }

    initStubResponses() {
        return [
            "Hello! I'm a stub AI assistant. How can I help you today?",
            "That's an interesting question! As a mock AI, I can provide sample responses for testing.",
            "I understand you're testing the proxy functionality. Everything seems to be working correctly!",
            "This is a simulated response from the AI service. In a real implementation, this would come from your chosen AI provider.",
            "Great! The message was received and processed by the stub service. You can now integrate with a real AI API.",
            "I'm responding with a delay to simulate real API behavior. This helps test the loading states.",
            "Your message has been processed successfully. The proxy is working as expected!",
            "This stub service helps you develop and test without API costs or rate limits.",
            "Feel free to ask anything - I'll provide varied responses to test different scenarios.",
            "The stub AI is working perfectly! You can now replace this with your preferred AI service."
        ];
    }

    getStubResponse(userMessage) {
        const message = userMessage.toLowerCase();

        if (message.includes('hello') || message.includes('hi')) {
            return "Hello! I'm a stub AI assistant ready to help with testing.";
        }

        if (message.includes('test')) {
            return "Test successful! The stub AI service is responding correctly.";
        }

        if (message.includes('error')) {
            return "This is a simulated error response for testing error handling.";
        }

        if (message.includes('help')) {
            return "I'm a stub AI for testing. Try asking about 'test', 'error', or anything else!";
        }

        const randomIndex = Math.floor(Math.random() * this.stubResponses.length);
        return this.stubResponses[randomIndex];
    }

    async callStubService(userMessage) {
        console.log('Calling stub service with message:', userMessage);

        // Simulate API delay
        const delay = 500 + Math.random() * 1500;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Simulate occasional errors (5% chance)
        if (Math.random() < 0.05) {
            throw new Error('Simulated network error');
        }

        return {
            choices: [{
                message: {
                    content: this.getStubResponse(userMessage)
                }
            }]
        };
    }

    async sendMessage() {
        console.log('sendMessage() called');

        if (!this.messageInput) {
            console.error('Message input not found');
            return;
        }

        const message = this.messageInput.value.trim();
        console.log('Message to send:', message);

        if (!message) {
            console.log('Empty message, returning');
            return;
        }

        this.messageInput.value = '';
        this.addMessage('user', message);
        this.showLoading(true);

        try {
            let data;

            // Always use stub if no API key is configured
            const useStub = this.config.useStub || this.config.apiKey.trim() === '';

            if (useStub) {
                console.log('Using stub service');
                data = await this.callStubService(message);
            } else {
                console.log('Using real API');
                const response = await fetch(this.config.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.config.apiKey}`
                    },
                    body: JSON.stringify({
                        model: this.config.model,
                        messages: this.messages,
                        max_tokens: 150
                    })
                });

                if (!response.ok) {
                    throw new Error(`API Error: ${response.status}`);
                }

                data = await response.json();
            }

            // FIXED: Correct array access syntax
            const aiResponse = data.choices[0].message.content;
            this.addMessage('assistant', aiResponse);

        } catch (error) {
            console.error('Error in sendMessage:', error);
            this.addMessage('error', `Error: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    showLoading(show) {
        if (this.loading) {
            this.loading.classList.toggle('hidden', !show);
        }

        const canSend = this.config.useStub || this.config.apiKey.trim() !== '';
        if (this.sendBtn) {
            this.sendBtn.disabled = show || !canSend;
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                await navigator.serviceWorker.register('./sw.js');
                console.log('Service Worker registered');
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing AI Proxy PWA');
    try {
        window.aiApp = new AIProxyPWA();
        console.log('AI Proxy PWA initialized successfully');
    } catch (error) {
        console.error('Failed to initialize AI Proxy PWA:', error);
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});