/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import * as path from 'path';

export let doc: vscode.TextDocument;
export let editor: vscode.TextEditor;
export let documentEol: string;
export let platformEol: string;

let extensionActivated = false;

/**
 * Activates the freemarker-vscode extension (idempotent) and opens
 * the given fixture document. The 2000ms post-activation sleep runs
 * only on the first call across the whole test run — subsequent
 * fixture opens are fast.
 */
export async function activate(docUri: vscode.Uri) {
	const ext = vscode.extensions.getExtension("prmichaelsen.freemarker-vscode")!;
	await ext.activate();
	if (!extensionActivated) {
		await sleep(2000); // Wait for LSP server activation on first open
		extensionActivated = true;
	}
	try {
		doc = await vscode.workspace.openTextDocument(docUri);
		editor = await vscode.window.showTextDocument(doc);
	} catch (e) {
		console.error(e);
	}
}

async function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export const getDocPath = (p: string) => {
	return path.resolve(__dirname, '../../testFixture', p);
};
export const getDocUri = (p: string) => {
	return vscode.Uri.file(getDocPath(p));
};

export async function setTestContent(content: string): Promise<boolean> {
	const all = new vscode.Range(
		doc.positionAt(0),
		doc.positionAt(doc.getText().length)
	);
	return editor.edit(eb => eb.replace(all, content));
}

export function toRange(sLine: number, sChar: number, eLine: number, eChar: number) {
	const start = new vscode.Position(sLine, sChar);
	const end = new vscode.Position(eLine, eChar);
	return new vscode.Range(start, end);
}

/**
 * Find the position of `needle` within line `lineNo` of `text`, then
 * return a vscode.Position pointing to the middle character of the
 * match. Throws if `needle` is not found on that line.
 *
 * Used by hover/completion tests to assert against a fixture without
 * hand-counting column numbers — the test names a directive / builtin
 * name and the helper locates it.
 */
export function findPos(text: string, lineNo: number, needle: string): vscode.Position {
	const lines = text.split('\n');
	const line = lines[lineNo];
	if (line === undefined) {
		throw new Error(`fixture has no line ${lineNo} (has ${lines.length})`);
	}
	const col = line.indexOf(needle);
	if (col < 0) {
		throw new Error(`needle '${needle}' not on line ${lineNo}: ${JSON.stringify(line)}`);
	}
	return new vscode.Position(lineNo, col + Math.floor(needle.length / 2));
}
