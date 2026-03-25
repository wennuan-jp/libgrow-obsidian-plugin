import {App, PluginSettingTab, Setting} from "obsidian";
import LibGrowPlugin from "./main";

export interface LibGrowSettings {
	lmStudioUrl: string;
	modelName: string;
	systemPrompt: string;
	showToolbarOnSelection: boolean;
}

export const DEFAULT_SETTINGS: LibGrowSettings = {
	lmStudioUrl: "http://localhost:1234",
	modelName: "local-model",
	systemPrompt: "You are libgrow, a specialized assistant for Obsidian. Your goal is to help users understand, analyze, and refine their notes. Be precise, academic, and insightful.",
	showToolbarOnSelection: true
}

export class LibGrowSettingTab extends PluginSettingTab {
	plugin: LibGrowPlugin;

	constructor(app: App, plugin: LibGrowPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		
		containerEl.createEl('h2', {text: 'LM Studio Connectivity'});

		new Setting(containerEl)
			.setName('Server URL')
			.setDesc('Endpoint for your local LM Studio server.')
			.addText(text => text
				.setPlaceholder('http://localhost:1234')
				.setValue(this.plugin.settings.lmStudioUrl)
				.onChange(async (value) => {
					this.plugin.settings.lmStudioUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Model name')
			.setDesc('Specify the model identifier to use.')
			.addText(text => text
				.setPlaceholder('local-model')
				.setValue(this.plugin.settings.modelName)
				.onChange(async (value) => {
					this.plugin.settings.modelName = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h2', {text: 'Behavior & AI Personalization'});

		new Setting(containerEl)
			.setName('Auto-show toolbar')
			.setDesc('Automatically show the floating toolbar when text is selected.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showToolbarOnSelection)
				.onChange(async (value) => {
					this.plugin.settings.showToolbarOnSelection = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('System prompt')
			.setDesc('The baseline personality and instructions for the AI.')
			.addTextArea(text => text
				.setPlaceholder('Enter system prompt...')
				.setValue(this.plugin.settings.systemPrompt)
				.onChange(async (value) => {
					this.plugin.settings.systemPrompt = value;
					await this.plugin.saveSettings();
				}));
	}
}
