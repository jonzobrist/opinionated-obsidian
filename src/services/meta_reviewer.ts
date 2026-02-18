import { LLMProvider } from './llm';
import { Comment } from './reviewer';

export class MetaReviewer {
    constructor(private provider: LLMProvider) { }

    async synthesize(comments: Comment[]): Promise<string> {
        if (comments.length === 0) return "No feedback to summarize.";

        const feedbackDump = comments.map(c => `[${c.personaName}]: ${c.text}`).join('\n');

        const systemPrompt = `You are a Meta-Reviewer. Your job is to synthesize multiple expert reviews into a cohesive, prioritized summary. 
Identify the most critical issues, high-level themes, and constructive path forward.
Use professional, executive tone. Use markdown formatting (headings, etc).`;

        const userPrompt = `Here is the feedback from various expert reviewers:\n\n${feedbackDump}\n\nPlease synthesize this into a "Bottom Line Up Front" summary followed by prioritized themes.`;

        try {
            const response = await this.provider.generate(userPrompt, systemPrompt);
            return response.text;
        } catch (e) {
            console.error("Meta-review synthesis failed", e);
            return "Meta-review synthesis failed. Please check individual feedback.";
        }
    }
}
