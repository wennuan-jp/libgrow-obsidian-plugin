import { MarkdownView, Plugin } from 'obsidian';
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
		this.registerDomEvent(document, 'mouseup', (evt: MouseEvent) => {
			this.handleSelection();
		});

		this.registerDomEvent(document, 'keyup', (evt: KeyboardEvent) => {
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
		const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (activeView) {
			const editor = activeView.editor;
			const selection = editor.getSelection();
			
			if (selection && selection.trim().length > 0) {
				// Show toolbar with a slight delay to ensure coordinates are updated
				setTimeout(() => {
					this.toolbar.show(editor);
				}, 50);
			} else {
				this.toolbar.hide();
			}
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
