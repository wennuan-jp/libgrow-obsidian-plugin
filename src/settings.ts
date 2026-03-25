import {App, PluginSettingTab, Setting} from "obsidian";
import LibGrowPlugin from "./main";

export interface LibGrowSettings {
	lmStudioUrl: string;
	modelName: string;
}

export const DEFAULT_SETTINGS: LibGrowSettings = {
	lmStudioUrl: "http://localhost:1234",
	modelName: "local-model"
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

		new Setting(containerEl)
			.setName('LM Studio URL')
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
	}
}
