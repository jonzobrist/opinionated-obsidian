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

export default class OpinionatedPlugin extends Plugin {
    settings: OpinionatedSettings = DEFAULT_SETTINGS;

    async onload() {
        await this.loadSettings();

        this.addRibbonIcon('dice', 'Opinionated Review', (evt: MouseEvent) => {
            new Notice('Review started...');
        });

        this.addCommand({
            id: 'run-opinionated-review',
            name: 'Run Opinionated Review',
            callback: () => {
                new Notice('Review started...');
            }
        });

        this.addSettingTab(new OpinionatedSettingTab(this.app, this));
    }

    onunload() { }

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
    }
}
