/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as path from 'path';
import * as os from 'node:os';
import * as fs from 'node:fs';

import { runTests } from '@vscode/test-electron';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../../');
    const extensionsDir = path.join(os.homedir(), '.vscode', 'extensions');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './index');

    const tmpDir = path.join(os.tmpdir(), 'vscode-test');
    try {
      fs.mkdirSync(tmpDir);
    } catch (e) { }


		// Download VS Code, unzip it and run the integration test
		await runTests({ 
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [
        "--user-data-dir", tmpDir,
        "--extensions-dir", extensionsDir,
      ],
    });
	} catch (err) {
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
