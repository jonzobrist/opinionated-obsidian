import * as React from 'react';
import { App, TFile, MarkdownView } from 'obsidian';

interface Comment {
    personaName: string;
    text: string;
    excerpt?: string;
}

interface ReviewComponentProps {
    app: App;
    file: TFile | null;
    settings: any;
}

export const ReviewComponent: React.FC<ReviewComponentProps> = ({ app, file, settings }) => {
    const [comments, setComments] = React.useState<Comment[]>([]);
    const [synthesis, setSynthesis] = React.useState<string>('');
    const [loading, setLoading] = React.useState(false);

    const loadReview = React.useCallback(async () => {
        if (!file) {
            setComments([]);
            setSynthesis('');
            return;
        }
        setLoading(true);

        try {
            const reviewFileName = `${file.basename} - Review.md`;
            const reviewFilePath = `${settings.reviewFolder}/${reviewFileName}`;
            const reviewFile = app.vault.getAbstractFileByPath(reviewFilePath);

            if (reviewFile instanceof TFile) {
                const content = await app.vault.read(reviewFile);
                const parsed = parseReviewFile(content);
                setComments(parsed.comments);
                setSynthesis(parsed.synthesis);
            } else {
                setComments([]);
                setSynthesis('');
            }
        } catch (e) {
            console.error("Failed to load review", e);
        } finally {
            setLoading(false);
        }
    }, [file, app.vault, settings.reviewFolder]);

    React.useEffect(() => {
        loadReview();
    }, [loadReview]);

    const onCommentClick = (excerpt: string) => {
        const leaf = app.workspace.getLeaf(false);
        const view = leaf.view;
        if (view instanceof MarkdownView) {
            const editor = view.editor;
            const content = editor.getValue();
            const index = content.indexOf(excerpt);
            if (index !== -1) {
                const pos = editor.offsetToPos(index);
                editor.setCursor(pos);
                editor.scrollIntoView({ from: pos, to: pos }, true);
            }
        }
    };

    if (!file) {
        return <div className="opinionated-review-empty">No active file</div>;
    }

    return (
        <div className="opinionated-review-container">
            <div className="opinionated-review-header">
                <h3>Review Feed</h3>
                <button onClick={loadReview} className="opinionated-refresh-btn">Refresh</button>
            </div>

            {loading && <div className="opinionated-loading">Loading review...</div>}

            {!loading && comments.length === 0 && !synthesis && (
                <div className="opinionated-no-review">No review found. Run a review to see feedback.</div>
            )}

            {!loading && synthesis && (
                <div className="opinionated-synthesis-card">
                    <div className="opinionated-slogan">Meta-Reviewer</div>
                    <div className="opinionated-synthesis-text">{synthesis}</div>
                </div>
            )}

            <div className="opinionated-comments-list">
                {comments.map((comment, i) => (
                    <div key={i} className="opinionated-comment-card">
                        <div className="opinionated-persona-badge">{comment.personaName}</div>
                        <div className="opinionated-comment-text">{comment.text}</div>
                        {comment.excerpt && (
                            <div
                                className="opinionated-comment-excerpt"
                                onClick={() => onCommentClick(comment.excerpt!)}
                            >
                                "{comment.excerpt}"
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

function parseReviewFile(content: string): { comments: Comment[], synthesis: string } {
    const comments: Comment[] = [];
    let synthesis = "";

    const metaMatch = content.match(/## Meta-Review Summary\n([\s\S]*?)\n\n##/);
    if (metaMatch) {
        synthesis = metaMatch[1].trim();
    }

    const sections = content.split('## Reviewer: ');
    for (let i = 1; i < sections.length; i++) {
        const section = sections[i];
        const lines = section.split('\n');
        const personaName = lines[0].trim();

        for (let j = 1; j < lines.length; j++) {
            const line = lines[j].trim();
            if (line.startsWith('- ')) {
                const text = line.substring(2);
                const quoteMatch = text.match(/"([^"]{5,})"/);
                comments.push({
                    personaName,
                    text,
                    excerpt: quoteMatch ? quoteMatch[1] : undefined
                });
            }
        }
    }

    return { comments, synthesis };
}
