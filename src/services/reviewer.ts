import { App, TFile, Notice } from 'obsidian';
import { LLMProvider, OpenAIProvider, AnthropicProvider, Persona } from './llm';
import { MetaReviewer } from './meta_reviewer';

export interface Comment {
    personaName: string;
    text: string;
    excerpt?: string;
    start?: number;
    end?: number;
}

export class Reviewer {
    constructor(private app: App, private settings: any) { }

    async review(file: TFile, personas: Persona[]): Promise<{ comments: Comment[], synthesis: string }> {
        const content = await this.app.vault.read(file);
        const provider = this.getProvider();

        if (!provider) {
            throw new Error("No LLM provider configured correctly.");
        }

        const reviewPromises = personas.map(async (persona) => {
            try {
                const systemPrompt = `${persona.systemPrompt}\n\nYour task is to provide feedback on the document. Format your response as a bulleted list of specific, actionable points. For each point, if possible, include a direct quote from the text in double quotes to indicate where the feedback applies.`;
                const response = await provider.generate(content, systemPrompt);

                // Parse bullets and excerpts
                const bullets = this.parseReviewOutput(response.text);
                return bullets.map(b => ({
                    personaName: persona.name,
                    text: b.text,
                    excerpt: b.excerpt
                }));
            } catch (e) {
                new Notice(`Error from persona ${persona.name}: ${e instanceof Error ? e.message : String(e)}`);
                return [];
            }
        });

        const results = await Promise.all(reviewPromises);
        const comments = results.flat();

        // Run Meta-Review synthesis
        const metaReviewer = new MetaReviewer(provider);
        const synthesis = await metaReviewer.synthesize(comments);

        return { comments, synthesis };
    }

    private getProvider(): LLMProvider | null {
        if (this.settings.openAIKey) {
            return new OpenAIProvider(this.settings.openAIKey);
        }
        if (this.settings.anthropicKey) {
            return new AnthropicProvider(this.settings.anthropicKey);
        }
        return null;
    }

    private parseReviewOutput(text: string): { text: string, excerpt?: string }[] {
        // Basic parsing for "- Feedback "Quote""
        const lines = text.split('\n');
        const results: { text: string, excerpt?: string }[] = [];

        for (const line of lines) {
            const cleaned = line.trim().replace(/^[-*+]\s*/, '');
            if (!cleaned) continue;

            const quoteMatch = cleaned.match(/"([^"]{5,})"/);
            results.push({
                text: cleaned,
                excerpt: quoteMatch ? quoteMatch[1] : undefined
            });
        }

        return results;
    }

    async saveReview(file: TFile, comments: Comment[], synthesis: string) {
        const reviewFolderPath = this.settings.reviewFolder;
        if (!await this.app.vault.adapter.exists(reviewFolderPath)) {
            await this.app.vault.createFolder(reviewFolderPath);
        }

        const reviewFileName = `${file.basename} - Review.md`;
        const reviewFilePath = `${reviewFolderPath}/${reviewFileName}`;

        let reviewContent = `---\ntags: [review]\noriginal_note: "[[${file.path}]]"\ndate: ${new Date().toISOString()}\n---\n\n# Review for ${file.basename}\n\n`;

        reviewContent += `## Meta-Review Summary\n${synthesis}\n\n`;

        // Group by persona
        const grouped = comments.reduce((acc, c) => {
            if (!acc[c.personaName]) acc[c.personaName] = [];
            acc[c.personaName].push(c);
            return acc;
        }, {} as Record<string, Comment[]>);

        for (const [persona, personaComments] of Object.entries(grouped)) {
            reviewContent += `## Reviewer: ${persona}\n`;
            for (const c of personaComments) {
                reviewContent += `- ${c.text}\n`;
            }
            reviewContent += `\n`;
        }

        let reviewFile = this.app.vault.getAbstractFileByPath(reviewFilePath);
        if (reviewFile instanceof TFile) {
            await this.app.vault.modify(reviewFile, reviewContent);
        } else {
            await this.app.vault.create(reviewFilePath, reviewContent);
        }

        // Update frontmatter in original file
        await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
            frontmatter['opinionated_review'] = `[[${reviewFilePath}|Latest Review]]`;
        });

        new Notice(`Review saved to ${reviewFilePath}`);
    }
}
