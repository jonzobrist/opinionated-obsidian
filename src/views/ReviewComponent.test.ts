import { describe, it, expect } from 'vitest';
import { parseReviewFile } from './ReviewComponent';

describe('ReviewComponent Parsing', () => {
    it('should parse a review markdown file correctly', () => {
        const content = `
---
tags: [review]
date: 2024-05-20T10:00:00Z
---

# Review for My Note

## Meta-Review Summary
This is a summary of the meta-review.

## Reviewer: Logic Critic
- Logical inconsistency in "first quote"
* Another point about "second quote"

## Reviewer: Style Editor
- Passive voice used in "third quote"
`;

        const { comments, synthesis } = parseReviewFile(content);

        expect(synthesis).toBe('This is a summary of the meta-review.');
        expect(comments).toHaveLength(3);
        expect(comments[0]).toEqual({
            personaName: 'Logic Critic',
            text: 'Logical inconsistency in "first quote"',
            excerpt: 'first quote'
        });
        expect(comments[2].personaName).toBe('Style Editor');
    });

    it('should handle missing meta summary', () => {
        const content = `## Reviewer: Critic\n- Point "quote"`;
        const { synthesis, comments } = parseReviewFile(content);
        expect(synthesis).toBe('');
        expect(comments).toHaveLength(1);
    });
});
