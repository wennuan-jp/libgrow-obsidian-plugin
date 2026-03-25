import { requestUrl, RequestUrlParam } from "obsidian";

interface OpenAIChatCompletionResponse {
	choices: Array<{
		message: {
			content: string;
		};
	}>;
}

/**
 * Call the local LM Studio service with the provided prompt and context.
 * 
 * @param baseUrl - The base URL of the LM Studio server (e.g., http://localhost:1234)
 * @param modelName - The model to use (e.g., local-model)
 * @param prompt - The instruction or predefined command
 * @param selectedContent - The specific text selected by the user
 * @param context - Optional surrounding text for context
 */
export async function callLMStudio(
	baseUrl: string, 
	modelName: string, 
	prompt: string, 
	selectedContent: string, 
	context?: string
) {
	// Ensure URL ends with /v1/chat/completions
	const endpoint = `${baseUrl.replace(/\/$/, "")}/v1/chat/completions`;

	const systemPrompt = "You are libgrow, a specialized assistant for Obsidian. Your goal is to help users understand, analyze, and refine their notes. Be precise, academic, and insightful.";
	
	const userMessage = context 
		? `Surrounding Context:\n${context}\n\nSelected Text:\n${selectedContent}\n\nTask:\n${prompt}`
		: `Selected Text:\n${selectedContent}\n\nTask:\n${prompt}`;

	const params: RequestUrlParam = {
		url: endpoint,
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			model: modelName,
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{
					role: "user",
					content: userMessage,
				},
			],
			temperature: 0.7,
			stream: false,
		}),
	};

	try {
		const response = await requestUrl(params);

		if (response.status === 200) {
			const responseObj = response.json as OpenAIChatCompletionResponse;
			if (responseObj.choices && responseObj.choices[0]) {
				return responseObj.choices[0].message.content;
			}
			throw new Error("Invalid response format from LM Studio.");
		} else {
			const errorMessage = response.json?.error?.message || response.text || "Unknown error";
			throw new Error(`LM Studio Error (${response.status}): ${errorMessage}`);
		}
	} catch (error) {
		console.error("libgrow LLM Error:", error);
		const message = error instanceof Error ? error.message : String(error);
		if (message.includes("failed to fetch") || message.includes("Connection failed")) {
			return "Error: Could not connect to LM Studio. Please ensure the server is running at the configured URL.";
		}
		return `Error: ${message}`;
	}
}
