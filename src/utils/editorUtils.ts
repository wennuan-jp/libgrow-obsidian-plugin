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
	editor: Editor, 
	linesBefore: number = 20, 
	linesAfter: number = 20
): string {
	const cursor = editor.getCursor("from");
	const lastLine = editor.lineCount() - 1;

	const startLine = Math.max(0, cursor.line - linesBefore);
	const endLine = Math.min(lastLine, cursor.line + linesAfter);

	let context = "";
	for (let i = startLine; i <= endLine; i++) {
		context += editor.getLine(i) + "\n";
	}

	return context.trim();
}
