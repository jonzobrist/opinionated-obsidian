import { requestUrl, RequestUrlParam } from 'obsidian';

export interface LLMResponse {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
    };
}

export interface Persona {
    id: string;
    name: string;
    systemPrompt: string;
    rules?: string[];
}

export abstract class LLMProvider {
    abstract generate(prompt: string, systemPrompt: string): Promise<LLMResponse>;
}

export class OpenAIProvider extends LLMProvider {
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model: string = 'gpt-4o-mini') {
        super();
        this.apiKey = apiKey;
        this.model = model;
    }

    async generate(prompt: string, systemPrompt: string): Promise<LLMResponse> {
        const params: RequestUrlParam = {
            url: 'https://api.openai.com/v1/chat/completions',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.2
            })
        };

        const response = await requestUrl(params);
        const data = response.json;
        return {
            text: data.choices[0].message.content,
            usage: {
                promptTokens: data.usage.prompt_tokens,
                completionTokens: data.usage.completion_tokens
            }
        };
    }
}

export class AnthropicProvider extends LLMProvider {
    private apiKey: string;
    private model: string;

    constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20240620') {
        super();
        this.apiKey = apiKey;
        this.model = model;
    }

    async generate(prompt: string, systemPrompt: string): Promise<LLMResponse> {
        const params: RequestUrlParam = {
            url: 'https://api.anthropic.com/v1/messages',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.model,
                system: systemPrompt,
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: 4096,
                temperature: 0.2
            })
        };

        const response = await requestUrl(params);
        const data = response.json;
        return {
            text: data.content[0].text,
            usage: {
                promptTokens: data.usage.input_tokens,
                completionTokens: data.usage.output_tokens
            }
        };
    }
}

// Placeholder for Bedrock - requires AWS SigV4 signing which is complex for a simple fetch.
// Will likely need a library or a signing helper.
export class BedrockProvider extends LLMProvider {
    constructor(private region: string, private accessKey: string, private secretKey: string) {
        super();
    }

    async generate(prompt: string, systemPrompt: string): Promise<LLMResponse> {
        throw new Error("Bedrock implementation requires AWS SigV4 signing. Placeholder for now.");
    }
}
