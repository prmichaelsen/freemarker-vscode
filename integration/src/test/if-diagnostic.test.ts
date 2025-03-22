/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate, toRange } from './helper';

suite('if diagnostics', () => {

	test('if no close', async () => {
		await testDiagnostics(getDocUri("if/if-no-close.ftl"), [
			{ 
        message: "Expected matching closing tag for 'if'", 
        range: toRange(0, 0, 0, 2), 
        severity: vscode.DiagnosticSeverity.Error,
      },
		]);
	});

	test('if mismatch', async () => {
		await testDiagnostics(getDocUri("if/if-mismatch.ftl"), [
			{ 
        message: "Expected one of 'if', 'else', 'elseif'", 
        range: toRange(1, 3, 1, 8), 
        severity: vscode.DiagnosticSeverity.Error,
      },
			{ 
        message: "Expected 'if'", 
        range: toRange(1, 3, 1, 8), 
        severity: vscode.DiagnosticSeverity.Error,
      },
		]);
	});

	test('if valid', async () => {
		await testDiagnostics(getDocUri("if/if-valid.ftl"), []);
	});

});


async function testDiagnostics(docUri: vscode.Uri, expectedDiagnostics: vscode.Diagnostic[]) {
	await activate(docUri);

	const actualDiagnostics = vscode.languages.getDiagnostics(docUri);

	assert.equal(actualDiagnostics.length, expectedDiagnostics.length);

	expectedDiagnostics.forEach((expectedDiagnostic, i) => {
		const actualDiagnostic = actualDiagnostics[i];
		assert.equal(actualDiagnostic.message, expectedDiagnostic.message);
		assert.deepEqual(actualDiagnostic.range, expectedDiagnostic.range);
		assert.equal(actualDiagnostic.severity, expectedDiagnostic.severity);
	});
}