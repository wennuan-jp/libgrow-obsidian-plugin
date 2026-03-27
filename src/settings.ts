import {App, PluginSettingTab, Setting} from "obsidian";
import LibGrowPlugin from "./main";

export interface CustomPrompt {
	id: string;
	name: string;
	template: string;
}

export interface LibGrowSettings {
	lmStudioUrl: string;
	modelName: string;
	systemPrompt: string;
	showToolbarOnSelection: boolean;
	customPrompts: CustomPrompt[];
}

export const DEFAULT_SETTINGS: LibGrowSettings = {
	lmStudioUrl: "http://localhost:1234",
	modelName: "local-model",
	systemPrompt: "You are libgrow, a specialized assistant for Obsidian. Your goal is to help users understand, analyze, and refine their notes. Be precise, academic, and insightful.",
	showToolbarOnSelection: true,
	customPrompts: [
		{ id: "explain", name: "Explain", template: "Explain this selection in detail: {selected}" },
		{ id: "summarize", name: "Summarize", template: "Summarize this content succinctly: {selected}" },
		{ id: "analyze", name: "Analyze", template: "Analyze this text and its context:\n\nSELECTED:\n{selected}\n\nCONTEXT:\n{context}" }
	]
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

		this.renderCustomPrompts(containerEl);
	}

	private renderCustomPrompts(containerEl: HTMLElement): void {
		containerEl.createEl('h2', {text: 'Custom Prompts'});
		containerEl.createEl('p', {text: 'Define your own AI actions. Use {selected} and {context} as placeholders.'});

		this.plugin.settings.customPrompts.forEach((prompt, index) => {
			const s = new Setting(containerEl)
				.setName(`Prompt #${index + 1}`)
				.addText(text => text
					.setPlaceholder('Action Name (e.g. Explain)')
					.setValue(prompt.name)
					.onChange(async (value) => {
						prompt.name = value;
						await this.plugin.saveSettings();
					}))
				.addTextArea(text => text
					.setPlaceholder('Template (use {selected}, {context})')
					.setValue(prompt.template)
					.onChange(async (value) => {
						prompt.template = value;
						await this.plugin.saveSettings();
					}))
				.addButton(btn => btn
					.setIcon("trash")
					.setTooltip("Delete prompt")
					.onClick(async () => {
						this.plugin.settings.customPrompts.splice(index, 1);
						await this.plugin.saveSettings();
						this.display();
					}));
			
			s.infoEl.remove(); // Remove the default name/desc container to save space
		});

		new Setting(containerEl)
			.addButton(btn => btn
				.setButtonText("Add new prompt")
				.setCta()
				.onClick(async () => {
					this.plugin.settings.customPrompts.push({
						id: `custom-${Date.now()}`,
						name: "New Action",
						template: "Task: {selected}"
					});
					await this.plugin.saveSettings();
					this.display();
				}));
	}
}

