# Project Plan: Opinionated Obsidian

## Vision
Transform Obsidian into a powerful document review workstation by integrating the multi-persona review capabilities of `OpinionatedDocReviewer`. The plugin will enable "opinionated" feedback directly on notes, anchored to content, with specialized criteria that can be targeted by folder or metadata.

## Core Features
1. **Multi-Persona Analysis**: Run parallel reviews from different AI "experts" (e.g., Security, Technical, Clarity).
2. **Text Anchoring**: Reviews automatically link to specific excerpts in the note text.
3. **Sidebar Feedback Feed**: A premium, dedicated view to browse and interact with reviewer comments.
4. **Folder-Based Auto-Criteria**: Automatically apply specific review personas to any file within designated folders.
5. **Frontmatter Configuration**: Override or supplement review rules using YAML frontmatter (e.g., `review_persona: legal`).
6. **Meta-Review Synthesis**: A "Meta-Reviewer" persona that summarizes and prioritizes all individual feedback.

## Technical Architecture
- **Language**: TypeScript
- **Framework**: React (for complex UI components in the sidebar)
- **Editor Integration**: Obsidian Markdown View + Codemirror 6 (for highlights)
- **AI Engine**: Pluggable (OpenAI, Anthropic, Bedrock)
- **Storage**: Vault-local settings and session-based review history.

## Development Phases

### Phase 1: Infrastructure & API
- [ ] Scaffold Obsidian plugin project.
- [ ] Implement LLM provider abstraction (OpenAI/Anthropic).
- [ ] Basic "Ping" command to verify AI connectivity.

### Phase 2: Persona System
- [ ] Persona CRUD in plugin settings.
- [ ] Persona Grouping (Review Packs).
- [ ] Folder-to-Persona mapping logic.

### Phase 3: Review Execution & Anchoring
- [ ] Note content extraction.
- [ ] Review orchestration (parallel calls).
- [ ] Text-based anchoring logic (fuzzy search for excerpts).
- [ ] Highlighting in the editor.

### Phase 4: Premium UI (Sidebar)
- [ ] Sidebar view registration.
- [ ] Comment card components with persona branding.
- [ ] Streaming support for real-time feedback.
- [ ] Navigation (clicking a comment scrolls the editor to the anchor).

### Phase 5: Advanced Features
- [ ] Meta-Reviewer synthesis.
- [ ] Frontmatter-based overrides.
- [ ] Exporting reviews to markdown.

## GitHub Management
- Repo: `opinionated-obsidian`
- Populate project boards and issues.
