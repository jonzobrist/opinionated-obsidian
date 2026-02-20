import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Reviewer } from './reviewer';
import { App, TFile } from 'obsidian';

describe('Reviewer Service', () => {
    let mockApp: any;
    let mockSettings: any;
    let reviewer: Reviewer;

    beforeEach(() => {
        mockApp = {
            vault: {
                read: vi.fn(),
                adapter: {
                    exists: vi.fn(),
                },
                createFolder: vi.fn(),
                getAbstractFileByPath: vi.fn(),
                modify: vi.fn(),
                create: vi.fn(),
            },
            fileManager: {
                processFrontMatter: vi.fn(),
            }
        };
        mockSettings = {
            openAIKey: 'test-key',
            reviewFolder: '_reviews'
        };
        reviewer = new Reviewer(mockApp as any, mockSettings);
    });

    describe('parseReviewOutput', () => {
        it('should extract bullets and excerpts correctly', () => {
            const text = '- Actionable feedback "specific quote"\n* Another point "second quote"';
            const content = 'This is the specific quote and the second quote here.';

            // Accessing private method for testing
            const results = (reviewer as any).parseReviewOutput(text, content);

            expect(results).toHaveLength(2);
            expect(results[0].excerpt).toBe('specific quote');
            expect(results[0].start).toBe(12);
            expect(results[1].excerpt).toBe('second quote');
            expect(results[1].start).toBe(35);
        });

        it('should handle fuzzy matching (case insensitive)', () => {
            const text = '- Feedback "SPECIFIC QUOTE"';
            const content = 'This is the specific quote.';

            const results = (reviewer as any).parseReviewOutput(text, content);

            expect(results[0].excerpt).toBe('specific quote');
            expect(results[0].start).toBe(12);
        });
    });
});
