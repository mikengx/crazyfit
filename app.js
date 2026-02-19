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
        this.aiServiceSelect = document.getElementById('ai-service');
        this.apiUrlInput = document.getElementById('api-url');
        this.apiKeyInput = document.getElementById('api-key');
        this.modelInput = document.getElementById('model');
        this.saveSettingsBtn = document.getElementById('save-settings');
        this.chat = document.getElementById('chat');
        this.messageInput = document.getElementById('message-input');
        this.sendBtn = document.getElementById('send-btn');
        this.loading = document.getElementById('loading');
        this.useStubCheckbox = document.getElementById('use-stub');

        // Check if all elements exist
        const elements = {
            settingsBtn: this.settingsBtn,
            settings: this.settings,
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

        if (this.aiServiceSelect) {
            this.aiServiceSelect.addEventListener('change', () => this.onServiceChange());
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
                aiService: 'stub',
                apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                apiKey: '',
                model: 'glm-4-flash',
                useStub: true
            };
        } catch (error) {
            console.error('Error loading config:', error);
            return {
                aiService: 'stub',
                apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                apiKey: '',
                model: 'glm-4-flash',
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

    onServiceChange() {
        const service = this.aiServiceSelect.value;

        const serviceConfigs = {
            'glm': {
                apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                model: 'glm-4-flash'
            },
            'openai': {
                apiUrl: 'https://api.openai.com/v1/chat/completions',
                model: 'gpt-3.5-turbo'
            },
            'anthropic': {
                apiUrl: 'https://api.anthropic.com/v1/messages',
                model: 'claude-3-sonnet-20240229'
            },
            'stub': {
                apiUrl: '',
                model: 'stub-model'
            }
        };

        if (serviceConfigs[service]) {
            this.apiUrlInput.value = serviceConfigs[service].apiUrl;
            this.modelInput.value = serviceConfigs[service].model;
            this.config.aiService = service;
            this.config.useStub = service === 'stub';

            if (this.useStubCheckbox) {
                this.useStubCheckbox.checked = this.config.useStub;
            }
        }
    }

    updateUI() {
        if (this.aiServiceSelect) this.aiServiceSelect.value = this.config.aiService || 'stub';
        if (this.apiUrlInput) this.apiUrlInput.value = this.config.apiUrl;
        if (this.apiKeyInput) this.apiKeyInput.value = this.config.apiKey;
        if (this.modelInput) this.modelInput.value = this.config.model;
        if (this.useStubCheckbox) this.useStubCheckbox.checked = this.config.useStub;

        const canSend = this.config.useStub || this.config.apiKey.trim() !== '';

        if (this.messageInput) {
            this.messageInput.disabled = !canSend;
            this.messageInput.placeholder = this.config.useStub ?
                'Type your fitness question (using demo mode)...' :
                `Ask your AI trainer (${this.config.aiService?.toUpperCase() || 'AI'})...`;
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
            aiService: this.aiServiceSelect ? this.aiServiceSelect.value : this.config.aiService,
            apiUrl: this.apiUrlInput ? this.apiUrlInput.value.trim() : this.config.apiUrl,
            apiKey: this.apiKeyInput ? this.apiKeyInput.value.trim() : this.config.apiKey,
            model: this.modelInput ? this.modelInput.value.trim() : this.config.model,
            useStub: this.useStubCheckbox ? this.useStubCheckbox.checked : this.config.useStub
        };
        this.saveConfig();
        this.updateUI();
        if (this.settings) {
            this.settings.classList.add('hidden');
        }

        // Clear messages when switching services
        this.messages = [];
        if (this.chat) {
            const messages = this.chat.querySelectorAll('.message');
            messages.forEach(msg => msg.remove());
        }

        console.log('Settings saved:', this.config);
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
            "Great! I'm your AI fitness trainer. Let's get you stronger! 💪",
            "Here's a personalized workout recommendation based on your goals.",
            "Remember: proper form is more important than heavy weights!",
            "Let's focus on compound movements for maximum efficiency.",
            "Don't forget to warm up before your workout and cool down after!",
            "Progressive overload is key - gradually increase weight, reps, or sets.",
            "Your workout plan is ready! Remember to stay hydrated.",
            "Consistency beats perfection. Keep showing up!",
            "Listen to your body - rest days are just as important as workout days.",
            "Nutrition is 70% of your results. Fuel your body properly!"
        ];
    }

    getStubResponse(userMessage) {
        const message = userMessage.toLowerCase();

        if (message.includes('chest') || message.includes('push')) {
            return "🏋️ Chest Workout:\n1. Push-ups: 3x10-15\n2. Bench Press: 3x8-12\n3. Incline Dumbbell Press: 3x10\n4. Chest Flyes: 3x12\n\nFocus on controlled movements!";
        }

        if (message.includes('leg') || message.includes('squat')) {
            return "🦵 Leg Day Routine:\n1. Squats: 3x12-15\n2. Lunges: 3x10 each leg\n3. Deadlifts: 3x8-10\n4. Calf Raises: 3x15\n\nKeep your core tight!";
        }

        if (message.includes('back') || message.includes('pull')) {
            return "🔙 Back Workout:\n1. Pull-ups: 3x5-10\n2. Bent-over Rows: 3x10\n3. Lat Pulldowns: 3x12\n4. Face Pulls: 3x15\n\nSqueeze your shoulder blades!";
        }

        if (message.includes('beginner') || message.includes('start')) {
            return "🌟 Beginner Program:\nWeek 1-2: Bodyweight exercises\nWeek 3-4: Light weights\nFocus on form first!\n\nStart with 3 workouts per week.";
        }

        if (message.includes('cardio') || message.includes('running')) {
            return "🏃 Cardio Options:\n1. Brisk walking: 30 min\n2. Cycling: 20-30 min\n3. Swimming: 20 min\n4. HIIT: 15-20 min\n\nMix it up for best results!";
        }

        const randomIndex = Math.floor(Math.random() * this.stubResponses.length);
        return this.stubResponses[randomIndex];
    }

    async callStubService(userMessage) {
        console.log('Calling stub service with message:', userMessage);

        // Simulate API delay
        const delay = 500 + Math.random() * 1500;
        await new Promise(resolve => setTimeout(resolve, delay));

        // Simulate occasional errors (optional - remove if you don't want random errors)
        // if (Math.random() < 0.05) {
        //     throw new Error('Simulated network error');
        // }

        // Return proper API-compatible format
        return {
            choices: [{
                message: {
                    content: this.getStubResponse(userMessage),
                    role: "assistant"
                },
                finish_reason: "stop",
                index: 0
            }],
            usage: {
                prompt_tokens: 10,
                completion_tokens: 20,
                total_tokens: 30
            },
            model: "stub-model",
            object: "chat.completion"
        };
    }

    async callGLMAI(userMessage) {
        console.log('Calling GLM AI with message:', userMessage);

        if (!this.config.apiKey || this.config.apiKey.trim() === '') {
            throw new Error('GLM AI API key is required');
        }

        const requestBody = {
            model: this.config.model || 'glm-4-flash',
            messages: [
                {
                    role: "system",
                    content: "You are an expert AI fitness trainer. Provide personalized workout recommendations, exercise guidance, and fitness advice. Keep responses concise but helpful. Focus on proper form, safety, and progressive training."
                },
                ...this.messages
            ],
            max_tokens: 500,
            temperature: 0.7
        };

        console.log('GLM AI Request:', requestBody);

        const response = await fetch(this.config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify(requestBody)
        });

        console.log('GLM AI Response Status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('GLM AI Error Response:', errorText);

            if (response.status === 401) {
                throw new Error('Invalid GLM AI API key');
            } else if (response.status === 429) {
                throw new Error('GLM AI rate limit exceeded');
            } else if (response.status === 500) {
                throw new Error('GLM AI service error');
            } else {
                throw new Error(`GLM AI Error: ${response.status} - ${errorText}`);
            }
        }

        const data = await response.json();
        console.log('GLM AI Response Data:', data);

        // Validate response structure
        if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
            console.error('Invalid GLM AI response structure:', data);
            throw new Error('Invalid response from GLM AI service');
        }

        return data;
    }

    async callOpenAI(userMessage) {
        console.log('Calling OpenAI with message:', userMessage);

        const response = await fetch(this.config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.config.apiKey}`
            },
            body: JSON.stringify({
                model: this.config.model,
                messages: [
                    {
                        role: "system",
                        content: "You are an expert AI fitness trainer. Provide personalized workout recommendations, exercise guidance, and fitness advice."
                    },
                    ...this.messages
                ],
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI Error: ${response.status}`);
        }

        return await response.json();
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

            if (this.config.useStub || this.config.aiService === 'stub') {
                console.log('Using stub service');
                data = await this.callStubService(message);
            } else if (this.config.aiService === 'glm') {
                console.log('Using GLM AI');
                data = await this.callGLMAI(message);
            } else if (this.config.aiService === 'openai') {
                console.log('Using OpenAI');
                data = await this.callOpenAI(message);
            } else {
                throw new Error('Unsupported AI service');
            }

            // Enhanced response validation
            console.log('API Response:', data);

            let aiResponse;

            // Handle different response structures
            if (data && data.choices && data.choices.length > 0) {
                const choice = data.choices[0];

                // OpenAI/GLM format: choices[0].message.content
                if (choice.message && choice.message.content) {
                    aiResponse = choice.message.content;
                }
                // Alternative format: choices[0].text
                else if (choice.text) {
                    aiResponse = choice.text;
                }
                // Alternative format: choices[0].content
                else if (choice.content) {
                    aiResponse = choice.content;
                }
                else {
                    console.error('Unexpected choice structure:', choice);
                    throw new Error('Invalid response format from AI service');
                }
            }
            // Handle direct content response
            else if (data && data.content) {
                aiResponse = data.content;
            }
            // Handle direct text response
            else if (data && data.text) {
                aiResponse = data.text;
            }
            else {
                console.error('Unexpected response structure:', data);
                throw new Error('Invalid response format from AI service');
            }

            if (!aiResponse || aiResponse.trim() === '') {
                throw new Error('Empty response from AI service');
            }

            this.addMessage('assistant', aiResponse.trim());

        } catch (error) {
            console.error('Error in sendMessage:', error);

            // More specific error messages
            let errorMessage = 'Unknown error occurred';

            if (error.message.includes('fetch')) {
                errorMessage = 'Network error - check your internet connection';
            } else if (error.message.includes('401')) {
                errorMessage = 'Invalid API key - please check your settings';
            } else if (error.message.includes('429')) {
                errorMessage = 'Rate limit exceeded - please try again later';
            } else if (error.message.includes('500')) {
                errorMessage = 'AI service temporarily unavailable';
            } else {
                errorMessage = error.message;
            }

            this.addMessage('error', `Error: ${errorMessage}`);

            // Auto-switch to demo mode if API fails
            if (!this.config.useStub && (error
                .message.includes('401') || error.message.includes('fetch'))) {
                console.log('API failed, suggesting demo mode');
                setTimeout(() => {
                    this.addMessage('assistant', '💡 Tip: You can use Demo Mode in settings for testing without an API key!');
                }, 1000);
            }
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
                console.log('Registering service worker...');
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('Service Worker registered successfully:', registration);

                // Listen for updates

                registration.addEventListener('updatefound', () => {
                    console.log('Service Worker update found');
                });

            } catch (error) {
                console.error('Service Worker registration failed:', error);
                // App will still work without service worker
            }
        } else {
            console.log('Service Worker not supported');
        }
    }

    // For debug only
    debugLastResponse() {
        console.log('=== DEBUG INFO ===');
        console.log('Current config:', this.config);
        console.log('Last messages:', this.messages.slice(-3));
        console.log('API URL:', this.config.apiUrl);
        console.log('Model:', this.config.model);
        console.log('Has API key:', !!this.config.apiKey);
        console.log('==================');
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