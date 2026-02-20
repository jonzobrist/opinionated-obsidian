import { StateField, StateEffect, RangeSetBuilder } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';

export const addReviewHighlight = StateEffect.define<{ from: number, to: number }>();
export const clearReviewHighlight = StateEffect.define<void>();

export const reviewHighlightField = StateField.define<DecorationSet>({
    create() {
        return Decoration.none;
    },
    update(highlights, tr) {
        highlights = highlights.map(tr.changes);
        for (let e of tr.effects) {
            if (e.is(addReviewHighlight)) {
                const builder = new RangeSetBuilder<Decoration>();
                builder.add(e.value.from, e.value.to, Decoration.mark({
                    class: 'opinionated-highlight-active'
                }));
                return builder.finish();
            } else if (e.is(clearReviewHighlight)) {
                return Decoration.none;
            }
        }
        return highlights;
    },
    provide: f => EditorView.decorations.from(f)
});
