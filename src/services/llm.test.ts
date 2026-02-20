import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenAIProvider, AnthropicProvider } from './llm';
import { requestUrl } from 'obsidian';

vi.mock('obsidian', () => ({
    requestUrl: vi.fn(),
}));

describe('LLM Providers', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('OpenAIProvider', () => {
        it('should format request correctly', async () => {
            const provider = new OpenAIProvider('test-key', 'test-model');
            (requestUrl as any).mockResolvedValue({
                json: {
                    choices: [{ message: { content: 'hello' } }],
                    usage: { prompt_tokens: 10, completion_tokens: 5 }
                }
            });

            const response = await provider.generate('prompt', 'system');

            expect(requestUrl).toHaveBeenCalledWith(expect.objectContaining({
                url: 'https://api.openai.com/v1/chat/completions',
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-key'
                })
            }));
            expect(response.text).toBe('hello');
        });
    });

    describe('AnthropicProvider', () => {
        it('should format request correctly', async () => {
            const provider = new AnthropicProvider('ant-key', 'ant-model');
            (requestUrl as any).mockResolvedValue({
                json: {
                    content: [{ text: 'claude response' }],
                    usage: { input_tokens: 20, output_tokens: 10 }
                }
            });

            const response = await provider.generate('prompt', 'system');

            expect(requestUrl).toHaveBeenCalledWith(expect.objectContaining({
                url: 'https://api.anthropic.com/v1/messages',
                headers: expect.objectContaining({
                    'x-api-key': 'ant-key'
                })
            }));
            expect(response.text).toBe('claude response');
        });
    });
});
