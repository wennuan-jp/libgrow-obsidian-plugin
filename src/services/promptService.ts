export interface LibGrowPrompt {
	id: string;
	name: string;
	prompt: string;
	icon?: string;
}

export const PREDEFINED_PROMPTS: LibGrowPrompt[] = [
	{
		id: "explain",
		name: "Explain",
		prompt: "Explain the selected text in simple terms, providing context and relevant examples if necessary.",
		icon: "info"
	},
	{
		id: "summarize",
		name: "Summarize",
		prompt: "Provide a concise summary of the selected text, highlighting the key points.",
		icon: "lucide-list"
	},
	{
		id: "related",
		name: "Related Concepts",
		prompt: "Identify and briefly explain concepts or topics related to the selected text that might be useful for further research.",
		icon: "link"
	},
	{
		id: "qa",
		name: "Generate Q&A",
		prompt: "Based on the selected text, generate 3 relevant questions and their answers to help with learning or review.",
		icon: "help-circle"
	}
];
