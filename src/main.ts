import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface OpinionatedSettings {
    openAIKey: string;
    anthropicKey: string;
    bedrockRegion: string;
    bedrockAccessKey: string;
    bedrockSecretKey: string;
    reviewFolder: string;
    personas: any[];
}

const DEFAULT_SETTINGS: OpinionatedSettings = {
    openAIKey: '',
    anthropicKey: '',
    bedrockRegion: 'us-east-1',
    bedrockAccessKey: '',
    bedrockSecretKey: '',
    reviewFolder: '_reviews',
    personas: []
}

import { OpenAIProvider } from './services/llm';
import { Reviewer } from './services/reviewer';

export default class OpinionatedPlugin extends Plugin {
    settings: OpinionatedSettings = DEFAULT_SETTINGS;

    async onload() {
        await this.loadSettings();

        this.addRibbonIcon('dice', 'Opinionated Review', async (evt: MouseEvent) => {
            const activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) {
                new Notice('No active note to review.');
                return;
            }
            await this.runReview(activeFile);
        });

        this.addCommand({
            id: 'run-opinionated-review',
            name: 'Run Opinionated Review',
            callback: async () => {
                const activeFile = this.app.workspace.getActiveFile();
                if (!activeFile) {
                    new Notice('No active note to review.');
                    return;
                }
                await this.runReview(activeFile);
            }
        });

        this.addCommand({
            id: 'test-ai-connection',
            name: 'Test AI Connection',
            callback: async () => {
                if (!this.settings.openAIKey) {
                    new Notice('No OpenAI API key found in settings.');
                    return;
                }
                new Notice('Testing OpenAI connection...');
                try {
                    const provider = new OpenAIProvider(this.settings.openAIKey);
                    const response = await provider.generate('Hello, say connection successful!', 'You are a helpful assistant.');
                    new Notice(`Response: ${response.text}`);
                } catch (e) {
                    new Notice(`Error: ${e instanceof Error ? e.message : String(e)}`);
                }
            }
        });

        this.addSettingTab(new OpinionatedSettingTab(this.app, this));
    }

    onunload() { }

    async runReview(file: any) {
        if (this.settings.personas.length === 0) {
            new Notice('No personas defined. Please add at least one in settings.');
            return;
        }

        new Notice('Running Opinionated Review...');
        try {
            const reviewer = new Reviewer(this.app, this.settings);
            const comments = await reviewer.review(file, this.settings.personas);
            await reviewer.saveReview(file, comments);
        } catch (e) {
            // The original instruction's catch block referenced 'persona.name' and 'return []',
            // which are not applicable in this context.
            // Assuming the intent was to improve the error message for the overall review process.
            new Notice(`Review failed: ${e instanceof Error ? e.message : String(e)}`);
        }
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

class OpinionatedSettingTab extends PluginSettingTab {
    plugin: OpinionatedPlugin;

    constructor(app: App, plugin: OpinionatedPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Opinionated Doc Reviewer' });

        containerEl.createEl('h3', { text: 'Storage' });
        new Setting(containerEl)
            .setName('Review Folder')
            .setDesc('Folder where review notes will be saved.')
            .addText(text => text
                .setPlaceholder('_reviews')
                .setValue(this.plugin.settings.reviewFolder)
                .onChange(async (value) => {
                    this.plugin.settings.reviewFolder = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', { text: 'LLM Providers' });

        new Setting(containerEl)
            .setName('OpenAI API Key')
            .addText(text => text
                .setPlaceholder('sk-...')
                .setValue(this.plugin.settings.openAIKey)
                .onChange(async (value) => {
                    this.plugin.settings.openAIKey = value;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Anthropic API Key')
            .addText(text => text
                .setPlaceholder('sk-ant-...')
                .setValue(this.plugin.settings.anthropicKey)
                .onChange(async (value) => {
                    this.plugin.settings.anthropicKey = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h4', { text: 'AWS Bedrock' });
        new Setting(containerEl)
            .setName('Region')
            .addText(text => text
                .setPlaceholder('us-east-1')
                .setValue(this.plugin.settings.bedrockRegion)
                .onChange(async (value) => {
                    this.plugin.settings.bedrockRegion = value;
                    await this.plugin.saveSettings();
                }));
        new Setting(containerEl)
            .setName('Access Key ID')
            .addText(text => text
                .setValue(this.plugin.settings.bedrockAccessKey)
                .onChange(async (value) => {
                    this.plugin.settings.bedrockAccessKey = value;
                    await this.plugin.saveSettings();
                }));
        new Setting(containerEl)
            .setName('Secret Access Key')
            .addText(text => text
                .setValue(this.plugin.settings.bedrockSecretKey)
                .onChange(async (value) => {
                    this.plugin.settings.bedrockSecretKey = value;
                    await this.plugin.saveSettings();
                }));

        containerEl.createEl('h3', { text: 'Personas' });
        containerEl.createEl('p', { text: 'Define the experts who will review your documents.' });

        this.plugin.settings.personas.forEach((persona, index) => {
            const s = new Setting(containerEl)
                .setName(persona.name || 'Unnamed Persona')
                .addText(text => text
                    .setPlaceholder('Persona Name')
                    .setValue(persona.name)
                    .onChange(async (value) => {
                        persona.name = value;
                        await this.plugin.saveSettings();
                    }))
                .addExtraButton(btn => btn
                    .setIcon('trash')
                    .setTooltip('Delete Persona')
                    .onClick(async () => {
                        this.plugin.settings.personas.splice(index, 1);
                        await this.plugin.saveSettings();
                        this.display();
                    }));

            new Setting(containerEl)
                .setName('System Prompt')
                .setDesc('Instructions for this AI persona.')
                .addTextArea(text => text
                    .setPlaceholder('You are a...')
                    .setValue(persona.systemPrompt)
                    .onChange(async (value) => {
                        persona.systemPrompt = value;
                        await this.plugin.saveSettings();
                    }));
        });

        new Setting(containerEl)
            .addButton(btn => btn
                .setButtonText('Add Persona')
                .onClick(async () => {
                    this.plugin.settings.personas.push({
                        id: Date.now().toString(),
                        name: 'New Persona',
                        systemPrompt: '',
                        rules: []
                    });
                    await this.plugin.saveSettings();
                    this.display();
                }));
    }
}
