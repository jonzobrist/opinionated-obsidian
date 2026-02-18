import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ReviewComponent } from './ReviewComponent';

export const VIEW_TYPE_REVIEW = 'opinionated-review-view';

export class ReviewView extends ItemView {
    root: ReactDOM.Root | null = null;
    activeFile: any = null;

    constructor(leaf: WorkspaceLeaf, private settings: any) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_REVIEW;
    }

    getDisplayText() {
        return 'Review Feed';
    }

    getIcon() {
        return 'dice';
    }

    async onOpen() {
        this.root = ReactDOM.createRoot(this.containerEl.children[1] as HTMLElement);
        this.render();
    }

    async onClose() {
        this.root?.unmount();
    }

    updateFile(file: any) {
        this.activeFile = file;
        this.render();
    }

    private render() {
        if (this.root) {
            this.root.render(
                <React.StrictMode>
                    <ReviewComponent
                        app={this.app}
                        file={this.activeFile}
                        settings={this.settings}
                    />
                </React.StrictMode>
            );
        }
    }
}
