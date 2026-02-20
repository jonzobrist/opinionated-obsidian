# Opinionated Doc Reviewer for Obsidian

Transform your Obsidian vault into a powerful AI-driven review studio. Opinionated Doc Reviewer brings multi-persona feedback, smart text anchoring, and meta-review synthesis directly to your notes.

Inspired by the original [OpinionatedDocReviewer](https://github.com/jonzobrist/OpinionatedDocReviewer), this plugin is designed for writers, researchers, and professional thinkers who need high-quality, diverse feedback on demand.

## ✨ Key Features

- **Multi-Persona Feedback**: Define a team of experts (e.g., "The Logic Checker," "The Creative Editor," "The Technical Specialist") to review your work simultaneously.
- **Smart Text Anchoring**: AI comments are linked directly to your text. Click a comment in the sidebar to jump to the exact location in your note with a visual highlight.
- **Meta-Review Synthesis**: Automatically summarizes feedback from all reviewers into a prioritized action plan.
- **Flexible Configuration**:
    - **Folder Inheritance**: Map personas to folders. Sub-folders automatically inherit their parents' reviewers.
    - **Frontmatter Overrides**: Use `opinionated_personas` or `opinionated_groups` to customize reviewers for a specific note.
- **Premium Sidebar Feed**: A dedicated React-based UI keeps your feedback accessible while you write.
- **Privacy & Storage**: Reviews are stored as Markdown files in your vault, keeping your data local and history-tracked via Git.

## 🚀 Getting Started

### 1. Installation
1. Search for "Opinionated Doc Reviewer" in the Obsidian community plugins (or install manually by placing `main.js`, `manifest.json`, and `styles.css` in `.obsidian/plugins/opinionated-obsidian`).
2. Enable the plugin in settings.

### 2. Setup LLM Providers
1. Go to **Settings > Opinionated Doc Reviewer**.
2. Enter your **OpenAI API Key** or **Anthropic API Key**.
3. (Optional) Configure the **Review Folder** where feedback notes will be saved (default: `_reviews`).

### 3. Define Your Personas
1. In settings, click **Add Persona**.
2. Give it a name (e.g., "Critical Critic").
3. Provide a **System Prompt** that defines its expert behavior.
   - *Example: "You are a logical analyst. Identify inconsistencies, leaps in logic, and weak arguments."*

### 4. Configure Review Logic
- **Folder Mappings**: Assign groups of personas to specific folders in your vault.
- **Persona Groups**: Group personas into "Review Packs" (e.g., "Technical Audit," "Polish & Syle") for easier assignment.

## 🛠️ Usage

1. Open a note you want reviewed.
2. Click the **Dice Icon** in the ribbon or use the command palette: `Run Opinionated Review`.
3. The AI will analyze your note in the background.
4. Once finished, the **Review Feed** sidebar will open, showing comments from all personas and the meta-review summary.
5. Click any comment's excerpt to navigate to the anchor in your text.

## 🏗️ Technical Architecture

- **Backend**: Integrates with OpenAI and Anthropic via Obsidian's `requestUrl`.
- **UI**: Built with **React** and **Lucide React** for a modern, responsive sidebar.
- **Highlighting**: Uses **CodeMirror 6 StateFields** for non-destructive, temporary highlights during navigation.
- **Data Model**: All reviewer logic is stored in standard Markdown frontmatter for vault portability.

## 📝 Frontmatter Configuration

You can override folder settings by adding the following to your note's frontmatter:

```yaml
---
opinionated_personas: ["persona-id-1", "persona-id-2"]
# OR
opinionated_groups: ["Technical Pack"]
---
```

## 🤝 Contributing

We welcome contributions! Please see our [PROJECT_PLAN.md](PROJECT_PLAN.md) for the roadmap.

---
*Created with ❤️ for the Obsidian Community.*
