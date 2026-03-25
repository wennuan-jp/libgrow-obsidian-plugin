import { Editor, MarkdownView, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, LibGrowSettings, LibGrowSettingTab } from "./settings";
import { FloatingToolbar } from "./ui/FloatingToolbar";

export default class LibGrowPlugin extends Plugin {
	settings: LibGrowSettings;
	private toolbar: FloatingToolbar;

	async onload() {
		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new LibGrowSettingTab(this.app, this));

		// Initialize Floating Toolbar
		this.toolbar = new FloatingToolbar(this.app, this.settings);

		// Selection event listeners: mouseup for primary, keyup for keyboard selection
		// Listening on window/document for global captures
		this.registerDomEvent(window, 'mouseup', (evt: MouseEvent) => {
			this.handleSelection();
		});

		this.registerDomEvent(window, 'keyup', (evt: KeyboardEvent) => {
			this.handleSelection();
		});

		// Also listen specifically on workspace container for high-reliability in Obsidian
		this.registerDomEvent(this.app.workspace.containerEl, 'mouseup', () => {
			this.handleSelection();
		});

		// Hide selection on scroll or window resize
		this.registerDomEvent(window, 'resize', () => {
			this.toolbar.hide();
		});

		console.log('libgrow plugin loaded');
	}

	onunload() {
		console.log('libgrow plugin unloaded');
		if (this.toolbar) {
			this.toolbar.remove();
		}
	}

	private handleSelection() {
		// Only check selection if the feature is enabled in settings
		if (!this.settings.showToolbarOnSelection) {
			this.toolbar.hide();
			return;
		}

		console.log("libgrow: investigating selection...");

		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		let selection = "";
		let editor: Editor | null = null;

		if (activeView) {
			editor = activeView.editor;
			selection = editor.getSelection();
		}

		// Fallback to window selection if editor selection is empty (e.g., Reading mode)
		if (!selection || selection.trim().length === 0) {
			const windowSelection = window.getSelection();
			if (windowSelection && windowSelection.toString().trim().length > 0) {
				selection = windowSelection.toString();
			}
		}

		console.log("libgrow selection discovered:", selection ? selection.length : 0);

		if (selection && selection.trim().length > 0) {
			console.log("libgrow: triggering toolbar display");
			// Show toolbar with a slight delay to ensure coordinates are updated
			setTimeout(() => {
				// If we have an editor, use it for context, otherwise pass a dummy editor for positioning
				if (editor) {
					this.toolbar.show(editor);
				} else {
					// Positioning in reading mode requires different logic, 
					// for now, we try to show it near the mouse coordinates or window selection
					this.toolbar.showWithFallback(selection);
				}
			}, 50);
		} else {
			this.toolbar.hide();
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
