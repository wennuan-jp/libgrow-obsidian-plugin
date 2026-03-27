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
- [x] **Performance**: Ensure selection listeners are debounced or efficient to prevent lag.
- [x] **Aesthetics**: Apply premium CSS styling to the toolbar (glassmorphism, subtle shadows).
- [x] **Documentation**: Update `README.md` with final installation and usage instructions.
- [x] **Final Testing**: Verify functionality on both Desktop and (if applicable) Mobile.

---

# New Features

## Feature #1: Streaming Side Panel
- [x] **Step 1.1: Side View Registration**
  - [x] Implement a custom `View` class for the sidebar.
  - [x] Register the view in `main.ts` and add a command/icon to toggle it.
- [x] **Step 1.2: Streaming LLM Integration**
  - [x] Update `llmClient.ts` to support fetching with streams.
  - [x] Implement handling for incoming chunks and reactive UI updates.
- [x] **Step 1.3: UI Controls**
  - [x] Add a **Stop** button to abort current fetch requests.
  - [x] Add a **Copy** button to copy the AI's response to the clipboard.

## Feature #2: Customizable Prompts & Semantic Context
- [x] **Step 2.1: Settings Infrastructure**
  - [x] Update `LibGrowSettings` to include a `customPrompts` array.
  - [x] Build a list-based UI in the Settings Tab for adding/deleting prompts.
- [x] **Step 2.2: Semantic Context Engine**
  - [x] Implement `getSemanticContext(editor)` in `editorUtils.ts`.
  - [x] Use paragraph-expansion logic to ensure context begins/ends on whole sentences.
- [x] **Step 2.3: Template Replacement & Dynamic Toolbar**
  - [x] Replace `{selected}` and `{context}` tags in templates.
  - [x] Update `FloatingToolbar.ts` to render custom user buttons dynamically.

## Feature #3: Settings Access in Side Panel
- [x] **Step 3.1: Settings Entry Point**
  - [x] Add a settings icon button (e.g., `lucide-settings`) to the side panel header.
  - [x] Map the button to trigger `this.app.setting.openTabById("libgrow-obsidian-plugin")`.

## Feature #4: Sticky Toolbar Positioning
- [x] **Step 4.1: Relative Positioning**
  - [x] Modify `FloatingToolbar.ts` to use relative positioning or absolute positioning tied to the editor scroll event.
- [x] **Step 4.2: Scroll Sync**
  - [x] Register a scroll listener on the editor container to reposition the toolbar as the user scrolls.

## Feature #5: more interactive selection indication in side panel
When user select a word or phrase in the editor, display the selection and context in the side panel(two text widget at the top)

---

# Adjustment
## [x] display the side panel icon as default
currently this icon is showed only when User click on items in floating bar. What I want is this icon is always visible in the right side bar. And the side panel is always opened default.

---

# Bugs
## 浮动工具栏在用户交互后未能正确隐藏，且点击行为未触发关闭逻辑
当浮动工具栏弹出后，无论用户执行何种操作（包括点击工具栏内的项目、切换标签页、打开设置页面，或点击 Obsidian 应用界面的任意其他区域），工具栏均保持显示状态，未能按预期自动隐藏。

预期行为：

用户点击浮动工具栏内的任意项目后，工具栏应立即关闭。
用户点击 Obsidian 应用界面内的任意位置（包括切换标签、打开新页面或点击空白处）后，工具栏应立即关闭。
当前问题：
目前的修复方案仅解决了部分场景（如点击工具栏项目），但未覆盖全局交互。在切换标签页、打开设置或点击应用其他区域时，浮动工具栏依然错误地停留在界面上，导致无法进行后续操作或遮挡视线。


---

## Progress Tracking
- **Last Updated**: 2026-03-25
- **Status**: Planning Phase
- **Target Version**: 1.0.0
