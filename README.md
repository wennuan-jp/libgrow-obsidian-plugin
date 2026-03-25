# libgrow

libgrow is an Obsidian plugin designed to enhance your reading and research workflow by integrating local LLM services (via LM Studio) directly into your selection process.

## Features

- **Floating Toolbar**: Automatically appears when text is selected in the editor.
- **AI-Powered Actions**: Quick buttons to **Explain**, **Summarize**, **Generate Q&A**, or find **Related Concepts**.
- **Context-Aware**: Sends selected text along with surrounding lines to the LLM for more accurate insights.
- **Local & Private**: Connects to your own LM Studio instance; no data leaves your machine (unless configured otherwise).
- **Customizable**: Change the LLM server URL, model name, and even the AI's system prompt to suit your needs.

## Getting Started with libgrow

### 1. Build the Plugin
Before installing, you must compile the source code into the final plugin files:
1.  Open your terminal in the project root.
2.  Run `npm install` to load dependencies.
3.  Run `npm run build` to generate `main.js`.

### 2. Manual Installation into Obsidian
To use this project in your Obsidian vault:
1.  Locate your Obsidian vault on your computer.
2.  Navigate to `<VaultFolder>/.obsidian/plugins/` (Note: `.obsidian` is a hidden folder).
3.  Create a new folder named `libgrow-obsidian-plugin`.
4.  Copy the following files from this project into that new folder:
    - `main.js`
    - `manifest.json`
    - `styles.css`
5.  Open Obsidian, go to **Settings → Community plugins**, and click the refresh icon.
6.  Find `libgrow` in the list and toggle it **ON**.

### 3. Basic Usage
1.  Open any note in your vault.
2.  **Select a word, sentence, or paragraph.**
3.  A floating toolbar will appear directly above your selection.
4.  **Click an action** (e.g., "Explain") to send the text to your local LM Studio service.
5.  View the AI-generated results in the popup modal.

## Settings

- **Server URL**: The endpoint of your LM Studio server (default: `http://localhost:1234`).
- **Model name**: The specific model loaded in LM Studio.
- **Auto-show toolbar**: Toggle whether the toolbar should pop up automatically on selection.
- **System prompt**: Customize the instructions and personality given to the AI.

## Development

- Install dependencies: `npm install`
- Build in development mode (watch): `npm run dev`
- Production build: `npm run build`

## License

MIT
