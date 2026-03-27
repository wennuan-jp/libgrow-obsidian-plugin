import { request as httpRequest } from "http";
import { request as httpsRequest } from "https";
import { parse } from "url";

/**
 * Call the local LM Studio service with streaming enabled using Node's http module
 * to bypass CORS and problematic OPTIONS preflights in local Desktop environments.
 */
export async function callLMStudioStreaming(
	baseUrl: string,
	modelName: string,
	systemPrompt: string,
	prompt: string,
	selectedContent: string,
	context: string | undefined,
	onChunk: (chunk: string) => void,
	abortSignal: AbortSignal
): Promise<void> {
	// Ensure URL ends with /v1/chat/completions correctly
	let cleanBaseUrl = baseUrl.trim().replace(/\/$/, "");
	if (!cleanBaseUrl.endsWith("/v1") && !cleanBaseUrl.includes("/v1/")) {
		cleanBaseUrl += "/v1";
	}
	const endpoint = `${cleanBaseUrl}/chat/completions`.replace(/\/v1\/v1/, "/v1");

	const userMessage = context 
		? `Surrounding Context:\n${context}\n\nSelected Text:\n${selectedContent}\n\nTask:\n${prompt}`
		: `Selected Text:\n${selectedContent}\n\nTask:\n${prompt}`;

	console.log(`libgrow: calling ${endpoint} via Node.js http (bypassing CORS)`);
	
	const body = JSON.stringify({
		model: modelName,
		messages: [
			{ role: "system", content: systemPrompt },
			{ role: "user", content: userMessage },
		],
		temperature: 0.7,
		max_tokens: -1,
		stream: true,
	});

	return new Promise((resolve, reject) => {
		try {
			const parsedUrl = parse(endpoint);
			const options = {
				hostname: parsedUrl.hostname || "localhost",
				port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
				path: parsedUrl.path,
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Accept": "text/event-stream",
					"Content-Length": Buffer.byteLength(body),
				},
			};

			const requestFn = parsedUrl.protocol === "https:" ? httpsRequest : httpRequest;
			
			const req = requestFn(options, (res) => {
				if (res.statusCode && (res.statusCode < 200 || res.statusCode >= 300)) {
					let errorBody = "";
					res.on("data", (chunk) => (errorBody += chunk));
					res.on("end", () => reject(new Error(`LM Studio Error (${res.statusCode}): ${errorBody}`)));
					return;
				}

				let buffer = "";

				res.on("data", (chunk) => {
					buffer += chunk.toString();
					const lines = buffer.split("\n");
					buffer = lines.pop() || "";

					for (const line of lines) {
						const trimmed = line.trim();
						if (!trimmed || trimmed === "data: [DONE]") continue;
						if (trimmed.startsWith("data: ")) {
							try {
								const data = JSON.parse(trimmed.slice(6));
								const content = data.choices[0]?.delta?.content;
								if (content) onChunk(content);
							} catch (e) {
								// Incomplete chunks are possible
							}
						}
					}
				});

				res.on("end", () => resolve());
				res.on("error", (e) => reject(e));
			});

			req.on("error", (e) => {
				if (e.message.includes("ECONNREFUSED")) {
					reject(new Error("Could not connect to LM Studio. Please ensure the server is running."));
				} else {
					reject(e);
				}
			});
			
			abortSignal.addEventListener("abort", () => {
				req.destroy();
				resolve();
			});

			req.write(body);
			req.end();
		} catch (e) {
			reject(e);
		}
	});
}
