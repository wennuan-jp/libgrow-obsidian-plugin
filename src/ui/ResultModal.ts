import { App, Modal, Notice, Setting } from "obsidian";

/**
 * A modal to display libgrow LLM results in a clear, formatted way.
 */
export class ResultModal extends Modal {
	private readonly result: string;
	private readonly title: string;

	constructor(app: App, title: string, result: string) {
		super(app);
		this.title = title;
		this.result = result;
	}

	onOpen() {
		const { contentEl } = this;
		
		contentEl.addClass("libgrow-result-container");
		
		contentEl.createEl("div", {
			text: this.title,
			cls: "libgrow-result-header"
		});

		const resultArea = contentEl.createEl("div", {
			cls: "libgrow-result-content"
		});

		// Basic markdown-like formatting for common AI responses
		// We use createSpan for primitive line breaks, better markdown rendering would involve more complexity
		const lines = this.result.split("\n");
		lines.forEach(line => {
			if (line.trim() === "") {
				resultArea.createEl("br");
			} else {
				resultArea.createSpan({ text: line });
				resultArea.createEl("br");
			}
		});

		new Setting(contentEl)
			.addButton(btn => btn
				.setButtonText("Copy to clipboard")
				.onClick(async () => {
					await navigator.clipboard.writeText(this.result);
					new Notice("Copied to clipboard");
				}))
			.addButton(btn => btn
				.setButtonText("Close")
				.onClick(() => {
					this.close();
				}));
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
