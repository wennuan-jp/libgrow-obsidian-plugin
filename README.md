# libgrow

libgrow is an Obsidian plugin designed to enhance your reading and research workflow by integrating local LLM services (via LM Studio) directly into your selection process.

## Features

- **Floating Toolbar**: Automatically appears when text is selected in the editor.
- **AI-Powered Actions**: Quick buttons to **Explain**, **Summarize**, **Generate Q&A**, or find **Related Concepts**.
- **Context-Aware**: Sends selected text along with surrounding lines to the LLM for more accurate insights.
- **Local & Private**: Connects to your own LM Studio instance; no data leaves your machine (unless configured otherwise).
- **Customizable**: Change the LLM server URL, model name, and even the AI's system prompt to suit your needs.

## Installation

1.  **Direct Install**: 
    - Ensure you have [LM Studio](https://lmstudio.ai/) running with a model loaded and the "Local Server" started.
    - Copy `main.js`, `styles.css`, and `manifest.json` to your vault's `.obsidian/plugins/libgrow-obsidian-plugin/` folder.
2.  **Enable**: Go to **Settings → Community plugins** and enable `libgrow`.

## Settings

- **Server URL**: The endpoint of your LM Studio server (default: `http://localhost:1234`).
- **Model Name**: The specific model loaded in LM Studio.
- **Auto-show Toolbar**: Toggle whether the toolbar should pop up automatically on selection.
- **System Prompt**: Customize the instructions and personality given to the AI.

## Development

- Install dependencies: `npm install`
- Build in development mode (watch): `npm run dev`
- Production build: `npm run build`

## License

MIT
