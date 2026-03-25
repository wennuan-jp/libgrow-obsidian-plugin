# libgrow Obsidian Plugin - Implementation Plan

## What is libgrow Obsidian Plugin?
libgrow is a dedicated Obsidian plugin designed to enhance the reading and research experience. 
Key features include:
- **Floating Popup Toolbar**: Automatically appears when text is selected within the Obsidian editor.
- **LM Studio Integration**: Invokes local LLM services (via LM Studio) using predefined prompts, selected content, and surrounding context.
- **Seamless Search & Reading**: Provides instant AI-powered insights and search capabilities directly within the note-taking environment.

## Development Specification (Dev Spec)
- **Language**: 100% TypeScript (`strict: true`).
- **Framework**: Obsidian Plugin API.
- **Service Integration**: Local LM Studio API (OpenAI-compatible chat completion endpoint).
- **UI/UX**: Minimalist floating toolbar, responsive to text selection events.
- **Architecture**: Modular structure as defined in `AGENTS.md`:
  - `src/main.ts`: Lifecycle management.
  - `src/ui/`: Toolbar and modal components.
  - `src/services/`: LLM client and external integrations.
  - `src/settings/`: Configuration management.
  - `src/utils/`: Helper functions.

---

## Implementation Checklist

### Phase 1: Foundation & Infrastructure
- [x] **Modularize Directory Structure**:
  - [x] Create `src/ui`, `src/services`, `src/settings`, `src/utils`.
  - [x] Move `llmCliient.ts` (and fix typo to `llmClient.ts`) to `src/services/`.
- [x] **Clean up `main.ts`**: Remove sample code (dice icon, sample modal, etc.) and focus on lifecycle hooks.

### Phase 2: Core LLM Integration
- [x] **Enhance `llmClient.ts`**:
  - [x] Support configurable base URL and model name.
  - [x] Implement robust error handling for "LM Studio not running".
  - [x] Add support for "Context" (surrounding lines of the selected text).
- [x] **Predefined Prompts**: Implement a system for managing predefined prompts (e.g., "Explain this", "Summarize", "Find related concepts").

### Phase 3: Floating Toolbar UI
- [x] **Selection Listener**: Implement a robust listener for text selection in the `Editor`.
- [x] **Toolbar Component**:
  - [x] Create a floating DOM element that positions itself near the selection.
  - [x] Add buttons for LLM actions (Explain, Summarize, etc.).
  - [x] Implement hover effects and smooth transitions (Aesthetic focus).
- [x] **Result Display**: Decide on how to show the AI response (Notice, inline below selection, or a small side-pane/modal).

### Phase 4: Settings & Configuration
- [x] **Settings Interface**:
  - [x] LM Studio URL (default: `http://localhost:1234`).
  - [x] Model identifier.
  - [x] Custom system prompt.
  - [x] Toggle for auto-show toolbar.
- [x] **Settings Tab**: Polish the UI in `src/settings/` to be user-friendly.

### Phase 5: Polish & Excellence
- [ ] **Performance**: Ensure selection listeners are debounced or efficient to prevent lag.
- [ ] **Aesthetics**: Apply premium CSS styling to the toolbar (glassmorphism, subtle shadows).
- [ ] **Documentation**: Update `README.md` with final installation and usage instructions.
- [ ] **Final Testing**: Verify functionality on both Desktop and (if applicable) Mobile.

---

## Progress Tracking
- **Last Updated**: 2026-03-25
- **Status**: Planning Phase
- **Target Version**: 1.0.0
