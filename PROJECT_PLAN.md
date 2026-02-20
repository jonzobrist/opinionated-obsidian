# Project Plan: Opinionated Obsidian

## Vision & Intent
Transform Obsidian into a comprehensive, multi-persona AI document review workstation. 
The core intent of this plugin is to provide **"opinionated" feedback** directly within your notes. Unlike generic AI chat tools, this plugin simulates a panel of specialized experts providing structured, anchored feedback on your writing. It leverages your existing Obsidian vault structure (folders, frontmatter, tags) to contextually target different review criteria, turning passive notes into active, reviewed manuscripts.

## Use Cases (Thinking Around Corners)
1. **Creative Writers & Novelists**:
    - *Personas*: Plot Hole Digger, Pacing Critic, Sensitivity Reader, Structural Editor.
    - *Scenario*: Provide a chapter; the panel reviews character consistency, pacing flow, and narrative arcs.
2. **Software Engineers & Technical Writers**:
    - *Personas*: Security Auditor, Clarity Specialist, Senior Architect.
    - *Scenario*: Review a system design document or README. The AI panel searches for edge cases, missing failure modes, and unclear documentation.
3. **Academics & Researchers**:
    - *Personas*: Methodological Skeptic, Peer Reviewer 2, Copy Editor.
    - *Scenario*: Run a manuscript through the panel before submission to anticipate journal rejection reasons and tighten arguments.
4. **Legal & Business Professionals**:
    - *Personas*: Loophole Finder, Risk Assessor, Compliance Officer.
    - *Scenario*: Analyze a contract or SLA to highlight potential liabilities and missing clauses.

## Core Features (Current & Planned)
1. **Multi-Persona Analysis**: Run parallel reviews from different AI "experts" simultaneously.
2. **Text Anchoring**: Reviews automatically link and highlight specific excerpts natively in the Obsidian editor.
3. **Sidebar Feedback Feed**: A premium, dedicated view to browse, navigate, and interact with reviewer comments.
4. **Folder-Based & Tag Auto-Criteria**: Automatically apply specific review personas to any file based on its location or tags.
    - *Inheritance-based*: Folders inherit rules.
    - *Mapping*: `work/contracts/` -> [`Loophole Finder`].
5. **Frontmatter Configuration**: Override or supplement review rules via YAML (e.g., `opinionated_review: true`, `evaluators: [legal]`).
6. **Meta-Review Synthesis**: A specialized "Meta-Reviewer" that reads the outputs of all other personas and provides a synthesized priority list of fixes.
7. **Actionable Resolutions**: "Accept/Reject" workflow to automatically apply AI-suggested text changes directly to the markdown document.
8. **Contextual RAG for Personas**: Allow Personas to reference a specific folder of notes (e.g., "Style Guides") as background knowledge before reviewing.
9. **Local Model Support**: Native integration with Ollama/LM Studio for offline, completely private document reviews.
10. **Automated Review Triggers**: Automatically kick off a review when a note's status changes to `#review_ready`.
11. **Review History & Diffing**: Track resolved comments and see how a document's quality score improves over time.

## Technical Architecture
- **Language**: TypeScript
- **Framework**: React (for complex UI components in the sidebar)
- **Editor Integration**: Obsidian Markdown View + Codemirror 6 (for highlights and text replacement)
- **AI Engine**: Pluggable support for **OpenAI**, **Anthropic (Claude)**, **AWS Bedrock**, and **Local LLMs (Ollama)**.
- **Storage Strategy**: 
    - Reviews stored logically (either in a dedicated `_reviews/` folder or as hidden plugin data).
    - Notes are linked to reviews via YAML frontmatter or data attributes.
- **Configuration**: Managed centrally via the Obsidian Community Plugin settings tab.

## Development Phases

### Phase 1: Infrastructure & API (Completed)
- [x] Scaffold Obsidian plugin project.
- [x] Implement LLM provider abstraction (OpenAI/Anthropic/Bedrock).
- [x] Basic "Ping" command to verify AI connectivity.

### Phase 2: Persona System
- [x] Persona CRUD in plugin settings.
- [ ] Persona Grouping (Review Packs).
- [x] Folder-to-Persona mapping logic.
- [ ] Tag-to-Persona mapping logic.

### Phase 3: Review Execution & Anchoring
- [x] Note content extraction.
- [x] Review orchestration (parallel calls).
- [x] Text-based anchoring logic (fuzzy search for excerpts).
- [x] Highlighting in the editor.
- [ ] Automated Review Triggers (e.g., on tag change).

### Phase 4: Premium UI (Sidebar) & UX
- [x] Sidebar view registration.
- [x] Comment card components with persona branding.
- [ ] Streaming support for real-time feedback.
- [x] Navigation (clicking a comment scrolls the editor to the anchor).
- [ ] Accept/Reject native text replacement workflow.

### Phase 5: Advanced Features & Synthesis
- [x] Meta-Reviewer synthesis.
- [x] Frontmatter-based overrides.
- [x] Exporting reviews to markdown.
- [ ] Contextual RAG for Personas (attach folders as knowledge bases).
- [ ] Review History & Resolved States.

### Phase 6: Local Privacy & Alternate Providers
- [ ] Ollama/LM Studio local provider integration.
- [ ] Proxy support for enterprise environments.

### Phase 7: Documentation & User Guide
- [x] Comprehensive `README.md` with setup instructions.
- [ ] User guide for Persona engineering.
- [ ] Documentation of the storage and anchoring logic.
- [ ] Example "Review Packs" (Academic, Creative Writing, Legal).

### Phase 8: Testing & Quality Assurance
- [x] Setup unit testing framework (Vitest).
- [x] Unit tests for LLM provider abstractions.
- [x] Unit tests for review parsing and anchoring logic.
- [ ] Integration tests for settings management.
- [x] CI workflow for running tests.

## GitHub Management
- Repo: `opinionated-obsidian`
- [ ] Populate project boards and issues for all uncompleted tasks across phases.
