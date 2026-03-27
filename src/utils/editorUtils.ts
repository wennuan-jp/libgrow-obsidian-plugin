import { Editor } from "obsidian";

/**
 * Extracts surrounding lines of the current selection in the editor.
 * 
 * @param editor - The active Obsidian editor instance
 * @param linesBefore - Number of lines to extract before the selection
 * @param linesAfter - Number of lines to extract after the selection
 * @returns The surrounding context as a single string
 */
export function getSurroundingContext(
	editor: Editor | null, 
	linesBefore: number = 20, 
	linesAfter: number = 20
): string {
	if (!editor) return "";
	
	try {
		const cursor = editor.getCursor("from");
		const lastLine = editor.lineCount() - 1;

		const startLine = Math.max(0, cursor.line - linesBefore);
		const endLine = Math.min(lastLine, cursor.line + linesAfter);

		let context = "";
		for (let i = startLine; i <= endLine; i++) {
			context += editor.getLine(i) + "\n";
		}

		return context.trim();
	} catch (e) {
		console.error("libgrow context error:", e);
		return "";
	}
}
/**
 * Gets semantic context from the editor by expanding the selection to whole paragraphs.
 * This ensures the context begins and ends on natural boundaries.
 * 
 * @param editor - The active Obsidian editor instance
 * @param maxChars - Maximum characters to return
 * @returns The expanded semantic context
 */
export function getSemanticContext(editor: Editor | null, maxChars: number = 3000): string {
    if (!editor) return "";
    
    try {
        const from = editor.getCursor("from");
        const to = editor.getCursor("to");
        
        let startLine = from.line;
        let endLine = to.line;
        
        // Expand upwards to find start of paragraph (blank line or beginning of file)
        while (startLine > 0 && editor.getLine(startLine - 1).trim() !== "") {
            startLine--;
        }
        
        // Expand downwards to find end of paragraph (blank line or end of file)
        while (endLine < editor.lineCount() - 1 && editor.getLine(endLine + 1).trim() !== "") {
            endLine++;
        }
        
        // Build the text from the expanded lines
        let context = "";
        for (let i = startLine; i <= endLine; i++) {
            context += editor.getLine(i) + "\n";
        }
        
        // If the context is still quite small, expand by one more paragraph both ways if possible
        if (context.length < 300) {
            let extraStart = startLine;
            if (extraStart > 0) {
                extraStart--; // Skip the existing blank line
                while (extraStart > 0 && editor.getLine(extraStart - 1).trim() !== "") {
                    extraStart--;
                }
            }

            let extraEnd = endLine;
            if (extraEnd < editor.lineCount() - 1) {
                extraEnd++; // Skip the existing blank line
                while (extraEnd < editor.lineCount() - 1 && editor.getLine(extraEnd + 1).trim() !== "") {
                    extraEnd++;
                }
            }
            
            context = "";
            for (let i = extraStart; i <= extraEnd; i++) {
                context += editor.getLine(i) + "\n";
            }
        }

        return context.trim().substring(0, maxChars);
    } catch (e) {
        console.error("libgrow semantic context error:", e);
        // Fallback to basic surrounding context if complex logic fails
        return getSurroundingContext(editor, 10, 10);
    }
}
