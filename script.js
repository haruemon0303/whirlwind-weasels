// ========================================
// Sound Novel Engine - 夜想曲
// ========================================

class SoundNovelEngine {
    constructor() {
        // Game State
        this.storyData = null;
        this.currentSceneId = null;
        this.currentLineIndex = 0;
        this.isTyping = false;
        this.readHistory = new Set(); // For skip feature (sceneId:lineIndex)
        this.backlog = []; // For backlog feature

        // Audio
        this.audioContext = null;
        this.currentBGM = null;
        this.bgmGainNode = null;
        this.seGainNode = null;
        this.bgmVolume = 0.7;
        this.seVolume = 0.8;

        // Features
        this.isAutoMode = false;
        this.isSkipMode = false;
        this.autoTimer = null;
        this.skipTimer = null;

        // UI Elements
        this.initUIElements();

        // Event Listeners
        this.initEventListeners();
    }

    initUIElements() {
        // Overlays and panels
        this.soundEnableOverlay = document.getElementById('soundEnableOverlay');
        this.gameContainer = document.getElementById('gameContainer');
        this.menuPanel = document.getElementById('menuPanel');
        this.logPanel = document.getElementById('logPanel');

        // Game elements
        this.bgLayer = document.getElementById('bgLayer');
        this.charLayer = document.getElementById('charLayer');
        this.effectLayer = document.getElementById('effectLayer');
        this.speakerName = document.getElementById('speakerName');
        this.textContent = document.getElementById('textContent');
        this.continueIndicator = document.getElementById('continueIndicator');
        this.choiceContainer = document.getElementById('choiceContainer');

        // Menu buttons
        this.menuBtn = document.getElementById('menuBtn');
        this.closeMenuBtn = document.getElementById('closeMenuBtn');
        this.saveBtn = document.getElementById('saveBtn');
        this.loadBtn = document.getElementById('loadBtn');
        this.titleBtn = document.getElementById('titleBtn');

        // Volume controls
        this.bgmVolumeSlider = document.getElementById('bgmVolume');
        this.seVolumeSlider = document.getElementById('seVolume');
        this.bgmVolumeValue = document.getElementById('bgmVolumeValue');
        this.seVolumeValue = document.getElementById('seVolumeValue');

        // Feature buttons
        this.autoBtn = document.getElementById('autoBtn');
        this.skipBtn = document.getElementById('skipBtn');
        this.logBtn = document.getElementById('logBtn');
        this.closeLogBtn = document.getElementById('closeLogBtn');
        this.logEntries = document.getElementById('logEntries');

        // Start button
        this.enableSoundBtn = document.getElementById('enableSoundBtn');
    }

    initEventListeners() {
        // Start button - Initialize audio context
        this.enableSoundBtn.addEventListener('click', () => this.enableSound());

        // Menu
        this.menuBtn.addEventListener('click', () => this.openMenu());
        this.closeMenuBtn.addEventListener('click', () => this.closeMenu());
        this.saveBtn.addEventListener('click', () => this.saveGame());
        this.loadBtn.addEventListener('click', () => this.loadGame());
        this.titleBtn.addEventListener('click', () => this.returnToTitle());

        // Volume controls
        this.bgmVolumeSlider.addEventListener('input', (e) => this.updateBGMVolume(e.target.value));
        this.seVolumeSlider.addEventListener('input', (e) => this.updateSEVolume(e.target.value));

        // Features
        this.autoBtn.addEventListener('click', () => this.toggleAuto());
        this.skipBtn.addEventListener('click', () => this.toggleSkip());
        this.logBtn.addEventListener('click', () => this.openLog());
        this.closeLogBtn.addEventListener('click', () => this.closeLog());

        // Game screen tap/click
        this.gameContainer.addEventListener('click', (e) => this.handleScreenClick(e));
    }

    async enableSound() {
        // Initialize AudioContext (iOS requirement)
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

        // Create gain nodes for volume control
        this.bgmGainNode = this.audioContext.createGain();
        this.bgmGainNode.connect(this.audioContext.destination);
        this.bgmGainNode.gain.value = this.bgmVolume;

        this.seGainNode = this.audioContext.createGain();
        this.seGainNode.connect(this.audioContext.destination);
        this.seGainNode.gain.value = this.seVolume;

        // Resume audio context (iOS requirement)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        // Load story data
        await this.loadStoryData();

        // Load saved settings
        this.loadSettings();

        // Hide overlay and show game
        this.soundEnableOverlay.style.display = 'none';
        this.gameContainer.style.display = 'flex';

        // Start game
        this.startGame();
    }

    async loadStoryData() {
        try {
            const response = await fetch('story.json');
            this.storyData = await response.json();
        } catch (error) {
            console.error('Failed to load story data:', error);
            alert('ストーリーデータの読み込みに失敗しました。');
        }
    }

    startGame() {
        this.currentSceneId = this.storyData.startSceneId;
        this.currentLineIndex = 0;
        this.loadScene();
    }

    loadScene() {
        const scene = this.storyData.scenes[this.currentSceneId];
        if (!scene) {
            console.error('Scene not found:', this.currentSceneId);
            return;
        }

        // Load background
        if (scene.bg) {
            this.bgLayer.style.backgroundImage = `url(${scene.bg})`;
        }

        // Load BGM
        if (scene.bgm) {
            this.playBGM(scene.bgm);
        }

        // Reset line index
        this.currentLineIndex = 0;

        // Show first line
        this.showNextLine();
    }

    showNextLine() {
        const scene = this.storyData.scenes[this.currentSceneId];
        if (!scene) return;

        // Check if all lines are shown
        if (this.currentLineIndex >= scene.lines.length) {
            // Show choices
            this.showChoices(scene.choices);
            return;
        }

        const line = scene.lines[this.currentLineIndex];

        // Mark as read
        const readKey = `${this.currentSceneId}:${this.currentLineIndex}`;
        this.readHistory.add(readKey);

        // Add to backlog
        this.addToBacklog(line);

        // Clear choices
        this.choiceContainer.innerHTML = '';

        // Hide continue indicator while typing
        this.continueIndicator.style.display = 'none';

        // Show speaker name
        if (line.speaker) {
            this.speakerName.textContent = line.speaker;
            this.speakerName.style.display = 'block';
        } else {
            this.speakerName.style.display = 'none';
        }

        // Play SE if specified
        if (line.se) {
            this.playSE(line.se);
        }

        // Apply effect if specified
        if (line.effect) {
            this.applyEffect(line.effect);
        }

        // Show text with typewriter effect
        this.typewriterEffect(line.text, () => {
            // Show continue indicator after typing
            this.continueIndicator.style.display = 'block';

            // Auto mode: automatically advance after delay
            if (this.isAutoMode) {
                this.autoTimer = setTimeout(() => {
                    this.advanceLine();
                }, 2000);
            }

            // Skip mode: automatically advance (if already read)
            if (this.isSkipMode && this.readHistory.has(readKey)) {
                this.skipTimer = setTimeout(() => {
                    this.advanceLine();
                }, 300);
            }
        });

        this.currentLineIndex++;
    }

    typewriterEffect(text, callback) {
        this.isTyping = true;
        this.textContent.textContent = '';
        let index = 0;

        const typeInterval = setInterval(() => {
            if (index < text.length) {
                this.textContent.textContent += text[index];
                index++;
            } else {
                clearInterval(typeInterval);
                this.isTyping = false;
                if (callback) callback();
            }
        }, 50); // 50ms per character

        // Store interval ID for skip functionality
        this.currentTypeInterval = typeInterval;
    }

    skipTypewriter() {
        if (this.currentTypeInterval) {
            clearInterval(this.currentTypeInterval);
            this.currentTypeInterval = null;
        }

        const scene = this.storyData.scenes[this.currentSceneId];
        const line = scene.lines[this.currentLineIndex - 1];
        if (line) {
            this.textContent.textContent = line.text;
        }

        this.isTyping = false;
        this.continueIndicator.style.display = 'block';
    }

    advanceLine() {
        // Clear timers
        if (this.autoTimer) {
            clearTimeout(this.autoTimer);
            this.autoTimer = null;
        }
        if (this.skipTimer) {
            clearTimeout(this.skipTimer);
            this.skipTimer = null;
        }

        this.showNextLine();
    }

    showChoices(choices) {
        if (!choices || choices.length === 0) return;

        this.choiceContainer.innerHTML = '';
        this.continueIndicator.style.display = 'none';

        choices.forEach((choice) => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.textContent = choice.label;
            btn.addEventListener('click', () => {
                this.selectChoice(choice.nextSceneId);
            });
            this.choiceContainer.appendChild(btn);
        });

        // Disable auto/skip when showing choices
        this.isAutoMode = false;
        this.isSkipMode = false;
        this.updateFeatureButtons();
    }

    selectChoice(nextSceneId) {
        this.currentSceneId = nextSceneId;
        this.currentLineIndex = 0;
        this.loadScene();
    }

    handleScreenClick(e) {
        // Ignore clicks on buttons, panels, etc.
        if (e.target.closest('button') ||
            e.target.closest('.menu-panel') ||
            e.target.closest('.log-panel') ||
            e.target.closest('.choice-container')) {
            return;
        }

        // If typing, skip to end of text
        if (this.isTyping) {
            this.skipTypewriter();
            return;
        }

        // If choices are shown, ignore
        if (this.choiceContainer.children.length > 0) {
            return;
        }

        // Advance to next line
        this.advanceLine();
    }

    applyEffect(effectName) {
        this.effectLayer.className = 'effect-layer';

        // Remove effect after animation
        setTimeout(() => {
            this.effectLayer.className = 'effect-layer';
        }, 1000);

        // Apply effect class
        if (effectName === 'flash') {
            this.effectLayer.classList.add('effect-flash');
        } else if (effectName === 'shake') {
            this.gameContainer.classList.add('effect-shake');
            setTimeout(() => {
                this.gameContainer.classList.remove('effect-shake');
            }, 500);
        } else if (effectName === 'noise') {
            this.effectLayer.classList.add('effect-noise');
            setTimeout(() => {
                this.effectLayer.classList.remove('effect-noise');
            }, 500);
        }
    }

    // ========================================
    // Audio Functions
    // ========================================

    playBGM(bgmId) {
        // Stop current BGM
        if (this.currentBGM) {
            this.currentBGM.stop();
            this.currentBGM = null;
        }

        // Generate BGM using Web Audio API
        this.currentBGM = this.generateBGM(bgmId);
    }

    generateBGM(bgmId) {
        if (!this.audioContext) return null;

        // Create oscillators for simple ambient BGM
        const osc1 = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const osc3 = this.audioContext.createOscillator();

        // Different frequencies for different BGMs
        if (bgmId === 'bgm_main') {
            osc1.frequency.value = 220; // A3
            osc2.frequency.value = 330; // E4
            osc3.frequency.value = 440; // A4
        } else if (bgmId === 'bgm_ending') {
            osc1.frequency.value = 262; // C4
            osc2.frequency.value = 330; // E4
            osc3.frequency.value = 392; // G4
        }

        osc1.type = 'sine';
        osc2.type = 'sine';
        osc3.type = 'triangle';

        // Create gain nodes for each oscillator
        const gain1 = this.audioContext.createGain();
        const gain2 = this.audioContext.createGain();
        const gain3 = this.audioContext.createGain();

        gain1.gain.value = 0.1;
        gain2.gain.value = 0.08;
        gain3.gain.value = 0.05;

        // Connect oscillators
        osc1.connect(gain1);
        osc2.connect(gain2);
        osc3.connect(gain3);

        gain1.connect(this.bgmGainNode);
        gain2.connect(this.bgmGainNode);
        gain3.connect(this.bgmGainNode);

        // Start oscillators
        osc1.start();
        osc2.start();
        osc3.start();

        // Return object with stop method
        return {
            stop: () => {
                osc1.stop();
                osc2.stop();
                osc3.stop();
            }
        };
    }

    playSE(seId) {
        if (!this.audioContext) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.seGainNode);

        // Different SE based on ID
        if (seId === 'knock') {
            // Door knock sound - low frequency pulse
            osc.frequency.value = 80;
            osc.type = 'square';
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (seId === 'door_open') {
            // Door open - low sweep
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);
            osc.type = 'sawtooth';
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            osc.start(now);
            osc.stop(now + 0.5);
        } else if (seId === 'lighter') {
            // Lighter click - high frequency short burst
            osc.frequency.value = 1200;
            osc.type = 'square';
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (seId === 'footstep') {
            // Footstep - medium frequency pulse
            osc.frequency.value = 150;
            osc.type = 'square';
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
            osc.start(now);
            osc.stop(now + 0.15);
        } else if (seId === 'ambient') {
            // Ambient noise - low frequency modulation
            osc.frequency.value = 60;
            osc.type = 'sawtooth';
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
            osc.start(now);
            osc.stop(now + 1);
        }
    }

    updateBGMVolume(value) {
        this.bgmVolume = value / 100;
        if (this.bgmGainNode) {
            this.bgmGainNode.gain.value = this.bgmVolume;
        }
        this.bgmVolumeValue.textContent = `${value}%`;
        this.saveSettings();
    }

    updateSEVolume(value) {
        this.seVolume = value / 100;
        if (this.seGainNode) {
            this.seGainNode.gain.value = this.seVolume;
        }
        this.seVolumeValue.textContent = `${value}%`;
        this.saveSettings();
    }

    // ========================================
    // Feature Functions
    // ========================================

    toggleAuto() {
        this.isAutoMode = !this.isAutoMode;
        if (this.isAutoMode) {
            this.isSkipMode = false; // Disable skip when auto is on
        }
        this.updateFeatureButtons();
    }

    toggleSkip() {
        this.isSkipMode = !this.isSkipMode;
        if (this.isSkipMode) {
            this.isAutoMode = false; // Disable auto when skip is on
        }
        this.updateFeatureButtons();
    }

    updateFeatureButtons() {
        this.autoBtn.textContent = `オート: ${this.isAutoMode ? 'ON' : 'OFF'}`;
        this.skipBtn.textContent = `スキップ: ${this.isSkipMode ? 'ON' : 'OFF'}`;
    }

    addToBacklog(line) {
        const entry = {
            speaker: line.speaker || '',
            text: line.text,
            type: line.type
        };

        this.backlog.push(entry);

        // Limit backlog size
        if (this.backlog.length > 100) {
            this.backlog.shift();
        }
    }

    openLog() {
        this.logPanel.classList.add('active');
        this.renderBacklog();
    }

    closeLog() {
        this.logPanel.classList.remove('active');
    }

    renderBacklog() {
        this.logEntries.innerHTML = '';

        this.backlog.forEach((entry) => {
            const div = document.createElement('div');
            div.className = 'log-entry';

            if (entry.speaker) {
                const speaker = document.createElement('div');
                speaker.className = 'speaker';
                speaker.textContent = entry.speaker;
                div.appendChild(speaker);
            }

            const text = document.createElement('div');
            text.className = 'text';
            text.textContent = entry.text;
            div.appendChild(text);

            this.logEntries.appendChild(div);
        });

        // Scroll to bottom
        this.logEntries.scrollTop = this.logEntries.scrollHeight;
    }

    // ========================================
    // Menu Functions
    // ========================================

    openMenu() {
        this.menuPanel.classList.add('active');
    }

    closeMenu() {
        this.menuPanel.classList.remove('active');
    }

    saveGame() {
        const saveData = {
            currentSceneId: this.currentSceneId,
            currentLineIndex: this.currentLineIndex,
            readHistory: Array.from(this.readHistory),
            backlog: this.backlog,
            timestamp: Date.now()
        };

        try {
            localStorage.setItem('soundNovelSave', JSON.stringify(saveData));
            alert('セーブしました。');
        } catch (error) {
            console.error('Save failed:', error);
            alert('セーブに失敗しました。');
        }
    }

    loadGame() {
        try {
            const saveData = JSON.parse(localStorage.getItem('soundNovelSave'));
            if (!saveData) {
                alert('セーブデータがありません。');
                return;
            }

            this.currentSceneId = saveData.currentSceneId;
            this.currentLineIndex = saveData.currentLineIndex;
            this.readHistory = new Set(saveData.readHistory || []);
            this.backlog = saveData.backlog || [];

            this.loadScene();
            this.closeMenu();
            alert('ロードしました。');
        } catch (error) {
            console.error('Load failed:', error);
            alert('ロードに失敗しました。');
        }
    }

    returnToTitle() {
        if (confirm('タイトルに戻りますか？')) {
            this.currentSceneId = this.storyData.startSceneId;
            this.currentLineIndex = 0;
            this.loadScene();
            this.closeMenu();
        }
    }

    saveSettings() {
        const settings = {
            bgmVolume: this.bgmVolume,
            seVolume: this.seVolume
        };

        localStorage.setItem('soundNovelSettings', JSON.stringify(settings));
    }

    loadSettings() {
        try {
            const settings = JSON.parse(localStorage.getItem('soundNovelSettings'));
            if (settings) {
                this.bgmVolume = settings.bgmVolume || 0.7;
                this.seVolume = settings.seVolume || 0.8;

                // Update UI
                this.bgmVolumeSlider.value = this.bgmVolume * 100;
                this.seVolumeSlider.value = this.seVolume * 100;
                this.bgmVolumeValue.textContent = `${Math.round(this.bgmVolume * 100)}%`;
                this.seVolumeValue.textContent = `${Math.round(this.seVolume * 100)}%`;

                // Update gain nodes
                if (this.bgmGainNode) {
                    this.bgmGainNode.gain.value = this.bgmVolume;
                }
                if (this.seGainNode) {
                    this.seGainNode.gain.value = this.seVolume;
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }
}

// ========================================
// Initialize Engine
// ========================================

let engine;

window.addEventListener('DOMContentLoaded', () => {
    engine = new SoundNovelEngine();
});
