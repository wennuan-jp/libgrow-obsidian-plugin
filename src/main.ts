import {Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, LibGrowSettings, LibGrowSettingTab} from "./settings";

export default class LibGrowPlugin extends Plugin {
	settings: LibGrowSettings;

	async onload() {
		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new LibGrowSettingTab(this.app, this));

		console.log('libgrow plugin loaded');
	}

	onunload() {
		console.log('libgrow plugin unloaded');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
