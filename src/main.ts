import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface OpinionatedSettings {
    openAIKey: string;
    anthropicKey: string;
    bedrockRegion: string;
    bedrockAccessKey: string;
    bedrockSecretKey: string;
    reviewFolder: string;
    folderMappings: Record<string, string[]>; // folder path -> persona IDs
    personas: any[];
}

const DEFAULT_SETTINGS: OpinionatedSettings = {
    openAIKey: '',
    anthropicKey: '',
    bedrockRegion: 'us-east-1',
    bedrockAccessKey: '',
    bedrockSecretKey: '',
    reviewFolder: '_reviews',
    folderMappings: {},
    personas: []
}

import { OpenAIProvider } from './services/llm';
import { Reviewer } from './services/reviewer';
import { ReviewView, VIEW_TYPE_REVIEW } from './views/ReviewView';

export default class OpinionatedPlugin extends Plugin {
    settings: OpinionatedSettings = DEFAULT_SETTINGS;

    async onload() {
        await this.loadSettings();

        this.registerView(
            VIEW_TYPE_REVIEW,
            (leaf) => new ReviewView(leaf, this.settings)
        );

        this.addRibbonIcon('dice', 'Opinionated Review', async (evt: MouseEvent) => {
            const activeFile = this.app.workspace.getActiveFile();
            if (!activeFile) {
                new Notice('No active note to review.');
                return;
            }
            await this.runReview(activeFile);
            this.activateView();
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
                this.activateView();
            }
        });

        this.addCommand({
            id: 'open-opinionated-review-view',
            name: 'Open Review Feed',
            callback: () => {
                this.activateView();
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

        this.registerEvent(
            this.app.workspace.on('file-open', (file) => {
                const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_REVIEW);
                leaves.forEach((leaf) => {
                    if (leaf.view instanceof ReviewView) {
                        leaf.view.updateFile(file);
                    }
                });
            })
        );
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf = workspace.getLeavesOfType(VIEW_TYPE_REVIEW)[0];
        if (!leaf) {
            const rightLeaf = workspace.getRightLeaf(false);
            if (rightLeaf) {
                await rightLeaf.setViewState({
                    type: VIEW_TYPE_REVIEW,
                    active: true,
                });
                leaf = rightLeaf;
            }
        }

        if (leaf) {
            workspace.revealLeaf(leaf);
            if (leaf.view instanceof ReviewView) {
                leaf.view.updateFile(this.app.workspace.getActiveFile());
            }
        }
    }

    onunload() { }

    async runReview(file: any) {
        let personasToUse = [];
        const filePath = file.path;
        const parts = filePath.split('/');

        // Collect personas from all parent folders (inheritance)
        let currentPath = '';
        for (const part of parts.slice(0, -1)) {
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            if (this.settings.folderMappings[currentPath]) {
                personasToUse.push(...this.settings.folderMappings[currentPath]);
            }
        }

        // Remove duplicates and hydrate
        personasToUse = [...new Set(personasToUse)];
        let hydratedPersonas = personasToUse.map(id => this.settings.personas.find((p: any) => p.id === id)).filter(p => !!p);

        // Fallback: Use all personas if no mapping matches
        if (hydratedPersonas.length === 0) {
            hydratedPersonas = this.settings.personas;
        }

        if (hydratedPersonas.length === 0) {
            new Notice('No personas defined. Please add at least one in settings.');
            return;
        }

        new Notice(`Running Opinionated Review with ${hydratedPersonas.length} personas...`);
        try {
            const reviewer = new Reviewer(this.app, this.settings);
            const { comments, synthesis } = await reviewer.review(file, hydratedPersonas);
            await reviewer.saveReview(file, comments, synthesis);
        } catch (e) {
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

        containerEl.createEl('h3', { text: 'Folder Criteria' });
        containerEl.createEl('p', { text: 'Automatically assign personas to specific folders. Sub-folders inherit parent mappings.' });

        Object.entries(this.plugin.settings.folderMappings).forEach(([folderPath, personaIds]) => {
            const s = new Setting(containerEl)
                .setName(folderPath || '/')
                .setDesc('Mapped to: ' + personaIds.map(id => this.plugin.settings.personas.find(p => p.id === id)?.name || id).join(', '))
                .addExtraButton(btn => btn
                    .setIcon('trash')
                    .setTooltip('Remove Mapping')
                    .onClick(async () => {
                        delete this.plugin.settings.folderMappings[folderPath];
                        await this.plugin.saveSettings();
                        this.display();
                    }));
        });

        new Setting(containerEl)
            .setName('Add Folder Mapping')
            .setDesc('Enter a folder path (e.g., work/contracts)')
            .addText(text => text
                .setPlaceholder('folder/path')
                .then(t => {
                    t.inputEl.onkeypress = async (e) => {
                        if (e.key === 'Enter') {
                            const val = t.getValue();
                            if (val && !this.plugin.settings.folderMappings[val]) {
                                this.plugin.settings.folderMappings[val] = [];
                                await this.plugin.saveSettings();
                                this.display();
                            }
                        }
                    };
                }));

        // For each folder mapping, allow toggling personas
        Object.keys(this.plugin.settings.folderMappings).forEach(folderPath => {
            containerEl.createEl('h4', { text: `Personas for ${folderPath}` });
            this.plugin.settings.personas.forEach(persona => {
                new Setting(containerEl)
                    .setName(persona.name)
                    .addToggle(toggle => toggle
                        .setValue(this.plugin.settings.folderMappings[folderPath].includes(persona.id))
                        .onChange(async (value) => {
                            if (value) {
                                this.plugin.settings.folderMappings[folderPath].push(persona.id);
                            } else {
                                this.plugin.settings.folderMappings[folderPath] = this.plugin.settings.folderMappings[folderPath].filter(id => id !== persona.id);
                            }
                            await this.plugin.saveSettings();
                        }));
            });
        });

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
