import { Editor, MarkdownView, Plugin, WorkspaceLeaf } from 'obsidian';
import { DEFAULT_SETTINGS, LibGrowSettings, LibGrowSettingTab } from "./settings";
import { FloatingToolbar } from "./ui/FloatingToolbar";
import { LibGrowSideView, VIEW_TYPE_LIBGROW } from "./ui/SideView";

export default class LibGrowPlugin extends Plugin {
	settings: LibGrowSettings;
	private toolbar: FloatingToolbar;

	async onload() {
		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new LibGrowSettingTab(this.app, this));

		// Register the side view
		this.registerView(
			VIEW_TYPE_LIBGROW,
			(leaf) => new LibGrowSideView(leaf)
		);

		// Add command to toggle the side view
		this.addCommand({
			id: "toggle-side-view",
			name: "Toggle AI side panel",
			callback: () => this.activateView(),
		});

		// Initialize Floating Toolbar
		this.toolbar = new FloatingToolbar(this.app, this.settings, this);

		// Dismiss toolbar on clicks, touches, tab switches, or any layout modification
		const dismissToolbar = (evt?: MouseEvent | PointerEvent) => {
			if (evt && this.toolbar && this.toolbar.isEventInToolbar(evt as any)) {
				return;
			}
			console.log("libgrow: global dismiss triggered");
			this.toolbar.hide();
		};

		this.registerDomEvent(document, 'mousedown', dismissToolbar, { capture: true });
		this.registerDomEvent(window, 'pointerdown', dismissToolbar, { capture: true });
		this.registerDomEvent(window, 'blur', () => this.toolbar.hide());
		this.registerDomEvent(window, 'focus', () => this.toolbar.hide());

		// Tab and Layout changes are critical for dismissing the toolbar when switching context
		this.registerEvent(this.app.workspace.on('active-leaf-change', () => this.toolbar.hide()));
		this.registerEvent(this.app.workspace.on('layout-change', () => this.toolbar.hide()));
		this.registerEvent(this.app.workspace.on('window-open', () => this.toolbar.hide()));

		// Re-apply selection checks only on mouseup/keyup
		this.registerDomEvent(window, 'mouseup', (evt: MouseEvent) => this.handleSelection());
		this.registerDomEvent(window, 'keyup', (evt: KeyboardEvent) => this.handleSelection());
		
		// Catch workspace level changes
		this.registerDomEvent(this.app.workspace.containerEl, 'mouseup', () => this.handleSelection());
		this.registerDomEvent(this.app.workspace.containerEl, 'mousedown', dismissToolbar, { capture: true });

		// Sticky toolbar: reposition on scroll
		this.registerDomEvent(document, 'scroll', (evt: Event) => {
			if (this.toolbar) {
				const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (activeView) {
					this.toolbar.reposition(activeView.editor);
				}
			}
		}, { capture: true });

		this.app.workspace.onLayoutReady(() => {
			void this.activateView();
		});

		// Standard resize dismissal
		this.registerDomEvent(window, 'resize', () => this.toolbar.hide());

		console.log('libgrow plugin loaded');
	}

	onunload() {
		console.log('libgrow plugin unloaded');
		if (this.toolbar) {
			this.toolbar.remove();
		}
	}

	private showTimeout: number | null = null;

	private handleSelection() {
		// Clear any pending show request
		if (this.showTimeout !== null) {
			window.clearTimeout(this.showTimeout);
			this.showTimeout = null;
		}

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
			this.showTimeout = window.setTimeout(() => {
				this.showTimeout = null;
				
				// Re-verify selection is still valid before showing
				const currentSelection = editor ? editor.getSelection() : window.getSelection()?.toString();
				if (!currentSelection || currentSelection.trim().length === 0) {
					this.toolbar.hide();
					return;
				}

				if (editor) {
					this.toolbar.show(editor);
				} else {
					this.toolbar.showWithFallback(selection);
				}
			}, 100); // 100ms for more stability
		} else {
			this.toolbar.hide();
		}
	}

	async activateView() {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_LIBGROW);

		if (leaves.length > 0) {
			leaf = leaves[0] as WorkspaceLeaf;
		} else {
			const rightLeaf = workspace.getRightLeaf(false);
			if (rightLeaf) {
				leaf = rightLeaf;
				await leaf.setViewState({ type: VIEW_TYPE_LIBGROW, active: true });
			}
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		if (this.toolbar) {
			this.toolbar.refreshButtons();
		}
	}
}
