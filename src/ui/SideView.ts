import { ItemView, WorkspaceLeaf, setIcon } from "obsidian";

export const VIEW_TYPE_LIBGROW = "libgrow-side-view";

export class LibGrowSideView extends ItemView {
	private resultEl: HTMLElement | null = null;
	private loadingEl: HTMLElement | null = null;
	private stopBtn: HTMLElement | null = null;
	private copyBtn: HTMLElement | null = null;
	private abortController: AbortController | null = null;

	constructor(leaf: WorkspaceLeaf) {
		super(leaf);
	}

	getViewType(): string {
		return VIEW_TYPE_LIBGROW;
	}

	getDisplayText(): string {
		return "libgrow AI";
	}

	getIcon(): string {
		return "bot";
	}

	async onOpen() {
		this.contentEl.empty();
		this.contentEl.addClass("libgrow-side-view");

		const header = this.contentEl.createEl("div", { cls: "libgrow-side-view-header" });
		header.createEl("h4", { text: "AI Analysis" });

		const controls = header.createEl("div", { cls: "libgrow-side-view-controls" });
		
		this.copyBtn = controls.createEl("button", {
			cls: ["libgrow-side-view-button", "clickable-icon"],
			attr: { "aria-label": "Copy response" }
		});
		setIcon(this.copyBtn, "copy");
		this.copyBtn.addEventListener("click", () => this.handleCopy());
		this.copyBtn.addClass("libgrow-hidden");

		this.stopBtn = controls.createEl("button", {
			cls: ["libgrow-side-view-button", "clickable-icon", "libgrow-stop-button"],
			attr: { "aria-label": "Stop generating" }
		});
		setIcon(this.stopBtn, "square");
		this.stopBtn.addEventListener("click", () => this.handleStop());
		this.stopBtn.addClass("libgrow-hidden");

		this.resultEl = this.contentEl.createEl("div", { cls: "libgrow-side-view-result" });
		this.resultEl.createEl("div", { 
			cls: "libgrow-side-view-placeholder", 
			text: "Select text and click a prompt in the toolbar to see results here." 
		});

		this.loadingEl = this.contentEl.createEl("div", { cls: "libgrow-side-view-loading libgrow-hidden" });
		this.loadingEl.createDiv({ cls: "libgrow-spinner" });
		this.loadingEl.createSpan({ text: "Thinking..." });
	}

	async onClose() {
		this.handleStop();
	}

	setResult(text: string) {
		if (this.resultEl) {
			this.resultEl.empty();
			this.resultEl.createEl("div", { cls: "libgrow-side-view-text", text: text });
			this.copyBtn?.removeClass("libgrow-hidden");
		}
	}

	appendChunk(chunk: string) {
		if (this.resultEl) {
			const placeholder = this.resultEl.querySelector(".libgrow-side-view-placeholder");
			if (placeholder) {
				this.resultEl.empty();
				this.resultEl.createEl("div", { cls: "libgrow-side-view-text" });
			}
			
			const textEl = this.resultEl.querySelector(".libgrow-side-view-text");
			if (textEl) {
				textEl.appendText(chunk);
				this.resultEl.scrollTop = this.resultEl.scrollHeight;
			}
		}
	}

	startLoading(abortController: AbortController) {
		this.abortController = abortController;
		this.loadingEl?.removeClass("libgrow-hidden");
		this.stopBtn?.removeClass("libgrow-hidden");
		this.copyBtn?.addClass("libgrow-hidden");
		
		if (this.resultEl) {
			this.resultEl.empty();
			this.resultEl.createEl("div", { cls: "libgrow-side-view-text" });
		}
	}

	stopLoading() {
		this.loadingEl?.addClass("libgrow-hidden");
		this.stopBtn?.addClass("libgrow-hidden");
		this.copyBtn?.removeClass("libgrow-hidden");
		this.abortController = null;
	}

	private handleStop() {
		if (this.abortController) {
			this.abortController.abort();
			this.stopLoading();
			this.appendChunk("\n\n[Stopped by user]");
		}
	}

	private handleCopy() {
		const textEl = this.resultEl?.querySelector(".libgrow-side-view-text");
		if (textEl) {
			navigator.clipboard.writeText(textEl.textContent || "");
		}
	}
}
