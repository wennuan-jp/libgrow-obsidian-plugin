import { App, Editor, setIcon } from "obsidian";
import { PREDEFINED_PROMPTS, LibGrowPrompt } from "../services/promptService";
import { callLMStudio } from "../services/llmClient";
import { LibGrowSettings } from "../settings";
import { getSurroundingContext } from "../utils/editorUtils";
import { ResultModal } from "./ResultModal";

/**
 * Manages the floating toolbar that appears near text selections.
 */
export class FloatingToolbar {
	private toolbarEl: HTMLElement | null = null;
	private loadingEl: HTMLElement | null = null;
	private currentEditor: Editor | null = null;
	private isVisible: boolean = false;
	private currentLoadingPromptId: string | null = null;

	constructor(private app: App, private settings: LibGrowSettings) {}

	/**
	 * Shows the toolbar near the current editor selection.
	 */
	show(editor: Editor) {
		this.currentEditor = editor;
		const selection = editor.getSelection();
		
		console.log("FloatingToolbar: show called, selection is:", selection);

		if (!selection || selection.trim().length === 0) {
			this.hide();
			return;
		}

		if (!this.toolbarEl) {
			console.log("FloatingToolbar: creating element");
			this.createToolbar();
		}

		this.isVisible = true;
		this.updatePosition(editor);
		
		if (this.toolbarEl) {
			this.toolbarEl.removeClass("libgrow-hidden");
			this.toolbarEl.removeClass("libgrow-fade-out");
			this.toolbarEl.addClass("libgrow-fade-in");
			console.log("FloatingToolbar: added visible classes to", this.toolbarEl);
		}
	}

	/**
	 * Fallback method for Reading mode or non-editor selections.
	 */
	showWithFallback(selection: string) {
		this.currentEditor = null;
		
		console.log("FloatingToolbar: showWithFallback called, selection is:", selection);

		if (!this.toolbarEl) {
			this.createToolbar();
		}

		this.isVisible = true;
		this.updatePositionFallback();
		
		if (this.toolbarEl) {
			this.toolbarEl.removeClass("libgrow-hidden");
			this.toolbarEl.removeClass("libgrow-fade-out");
			this.toolbarEl.addClass("libgrow-fade-in");
		}
	}

	/**
	 * Positions the toolbar near the window selection coordinates.
	 */
	private updatePositionFallback() {
		if (!this.toolbarEl) return;

		try {
			const selection = window.getSelection();
			if (!selection || selection.rangeCount === 0) return;

			const range = selection.getRangeAt(0);
			const coords = range.getBoundingClientRect();
			
			console.log("FloatingToolbar: fallback coordinates found:", coords);

			const toolbarWidth = this.toolbarEl.offsetWidth || 300;
			const toolbarHeight = this.toolbarEl.offsetHeight || 50;

			let left = (coords.left + coords.right) / 2 - toolbarWidth / 2;
			let top = coords.top - toolbarHeight - 10;

			left = Math.max(10, Math.min(window.innerWidth - toolbarWidth - 10, left));
			top = Math.max(10, Math.min(window.innerHeight - toolbarHeight - 10, top));

			this.toolbarEl.setCssProps({
				"left": `${left}px`,
				"top": `${top}px`
			});
		} catch (e) {
			console.error("libgrow position error:", e);
		}
	}

	/**
	 * Hides the toolbar from view.
	 */
	hide() {
		if (this.toolbarEl && this.isVisible) {
			console.log("FloatingToolbar: hiding");
			this.toolbarEl.removeClass("libgrow-fade-in");
			this.toolbarEl.addClass("libgrow-fade-out");
			// Use timeout to allow transition to finish
			setTimeout(() => {
				if (this.toolbarEl && !this.isVisible) {
					this.toolbarEl.addClass("libgrow-hidden");
				}
			}, 200);
		}
		this.isVisible = false;
		this.stopLoading();
	}

	/**
	 * Creates the toolbar's DOM elements and appends to the editor or window.
	 */
	private createToolbar() {
		this.toolbarEl = document.createElement("div");
		this.toolbarEl.addClass("libgrow-toolbar");
		this.toolbarEl.addClass("libgrow-hidden");
		document.body.appendChild(this.toolbarEl);
		console.log("FloatingToolbar: element appended to body");

		PREDEFINED_PROMPTS.forEach(prompt => {
			const button = this.toolbarEl!.createEl("button", {
				cls: ["libgrow-toolbar-button", "clickable-icon"],
				attr: { "aria-label": prompt.name }
			});
			
			if (prompt.icon) {
				setIcon(button, prompt.icon);
			}
			
			button.createSpan({ text: prompt.name });
			
			button.addEventListener("click", (e) => {
				e.preventDefault();
				void this.handlePromptClick(prompt);
			});
		});

		// Loading indicator (hidden by default)
		this.loadingEl = this.toolbarEl.createEl("div", {
			cls: "libgrow-loading"
		});
		this.loadingEl.addClass("libgrow-hidden");
		this.loadingEl.createEl("div", { cls: "libgrow-spinner" });
		this.loadingEl.createSpan({ text: "Processing..." });
	}

	/**
	 * Positions the toolbar near the cursor coordinates.
	 */
	private updatePosition(editor: Editor) {
		if (!this.toolbarEl) return;

		try {
			// getSelectionCoords gets pixel coordinates of the selection
			// Use a safer way to get selection coords
			let coords: any = null;
			if ((editor as any).getSelectionCoords) {
				coords = (editor as any).getSelectionCoords();
			} else if ((editor as any).coordsAtPos) {
				coords = (editor as any).coordsAtPos(editor.getCursor("from"));
				if (coords) {
					// Adapt coordsAtPos to the same format
					coords = {
						left: coords.left,
						right: coords.right || coords.left,
						top: coords.top,
						bottom: coords.bottom
					};
				}
			}

			console.log("FloatingToolbar: coordinates found:", coords);

			if (!coords) return;

			const toolbarWidth = this.toolbarEl.offsetWidth || 300;
			const toolbarHeight = this.toolbarEl.offsetHeight || 50;

			// Center the toolbar horizontally above selection
			let left = (coords.left + coords.right) / 2 - toolbarWidth / 2;
			let top = coords.top - toolbarHeight - 10;

			// Basic viewport bounds checking
			left = Math.max(10, Math.min(window.innerWidth - toolbarWidth - 10, left));
			top = Math.max(10, Math.min(window.innerHeight - toolbarHeight - 10, top));

			console.log(`FloatingToolbar: positioning at ${left}, ${top}`);

			this.toolbarEl.setCssProps({
				"left": `${left}px`,
				"top": `${top}px`
			});
		} catch (e) {
			console.error("libgrow position error:", e);
		}
	}

	/**
	 * Handles a click on a predefined prompt button.
	 */
	private async handlePromptClick(prompt: LibGrowPrompt) {
		if (!this.currentEditor) return;
		const selectedText = this.currentEditor.getSelection();
		if (!selectedText) return;

		this.startLoading(prompt.id);
		
		// Extract surrounding context (Phase 2 feature)
		const context = getSurroundingContext(this.currentEditor);
		
		try {
			const response = await callLMStudio(
				this.settings.lmStudioUrl,
				this.settings.modelName,
				this.settings.systemPrompt,
				prompt.prompt,
				selectedText,
				context
			);
			
			this.stopLoading();
			this.hide(); // Hide toolbar after successful click to focus on results
			
			// Show the results in our custom modal
			new ResultModal(this.app, prompt.name, response).open();
		} catch (error) {
			this.stopLoading();
			console.error("libgrow handler error:", error);
		}
	}

	private startLoading(promptId: string) {
		this.currentLoadingPromptId = promptId;
		if (this.toolbarEl) {
			// Hide buttons, show loading
			this.toolbarEl.querySelectorAll(".libgrow-toolbar-button").forEach((btn: HTMLElement) => {
				btn.addClass("libgrow-hidden");
			});
			if (this.loadingEl) this.loadingEl.removeClass("libgrow-hidden");
		}
	}

	private stopLoading() {
		this.currentLoadingPromptId = null;
		if (this.toolbarEl) {
			// Show buttons, hide loading
			this.toolbarEl.querySelectorAll(".libgrow-toolbar-button").forEach((btn: HTMLElement) => {
				btn.removeClass("libgrow-hidden");
			});
			if (this.loadingEl) this.loadingEl.addClass("libgrow-hidden");
		}
	}

	/**
	 * Force destroy the toolbar DOM element cleanup.
	 */
	remove() {
		if (this.toolbarEl) {
			this.toolbarEl.remove();
			this.toolbarEl = null;
		}
	}
}
