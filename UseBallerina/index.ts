/**
 * Copyright (c) 2023, WSO2 LLC (http://www.wso2.com) All Rights Reserved.
 *
 * WSO2 LLC licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import tl = require('azure-pipelines-task-lib');
import * as toolLib from 'azure-pipelines-tool-lib';
import { ToolRunner } from 'azure-pipelines-task-lib/toolrunner';
import * as os from 'os';
import path = require('path');

const osPlat: string = os.platform();

//TODO - Add caching
//TODO - Add tests

async function run() {
    try {
        tl.setResourcePath(path.join(__dirname, 'task.json'));
        const version: string = tl.getInputRequired('version');
        let downloadUrl: string;

        downloadUrl = `https://dist.ballerina.io/downloads/${version}/ballerina-${version}-swan-lake-`;
        if (osPlat == 'darwin') {
            downloadUrl = downloadUrl + "macos-x64.pkg";
            let downloadPath: string = await downloadTool(downloadUrl, "ballerina.pkg", version);
            await runPkgInstaller(downloadPath);
            toolLib.prependPath("/Library/Ballerina/bin");
        } else if (osPlat == 'linux') {
            downloadUrl = downloadUrl + "linux-x64.deb";
            let downloadPath: string = await downloadTool(downloadUrl, "ballerina.deb", version);
            await runDebInstaller(downloadPath);
            toolLib.prependPath("/usr/lib/ballerina/bin");
        } else if (osPlat == 'win32') {
            downloadUrl = downloadUrl + "windows-x64.msi";
            let downloadPath: string = await downloadTool(downloadUrl, "ballerina.msi", version);
            await runMsiInstaller(downloadPath);
            toolLib.prependPath("C:\\Program Files\\Ballerina\\bin");
        } else {
            throw new Error(tl.loc('UnexpectedOS', osPlat));
        }
    }
    catch (err: any) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();

async function downloadTool(url: string, fileName: string, version: string): Promise<string> {
    try {
        return await toolLib.downloadTool(url, fileName);
    } catch (err: any) {
        throw new Error(tl.loc('BallerinaVersionNotFound', version, osPlat));
    }
}


/**
 * Install a .pkg file.
 * Only for macOS.
 * Returns promise with return code.
 * @param pkgPath Path to a .pkg file.
 * @returns number
 */
async function runPkgInstaller(pkgPath: string): Promise<number> {
    const installer = sudo('installer');
    installer.line(`-package "${pkgPath}" -target /`);
    return installer.exec();
}

/**
 * Install a dpkg file.
 * Only for Debian based OS.
 * Returns promise with return code.
 * @param debPath Path to a .deb file.
 * @returns number
 */
async function runDebInstaller(debPath: string): Promise<number> {
    const installer = sudo('dpkg');
    installer.line(`-i "${debPath}"`);
    return installer.exec();
}

/**
 * Install a msi file.
 * Only for windows based OS.
 * Returns promise with return code.
 * @param msiPath Path to a .msi file.
 * @returns number
 */
async function runMsiInstaller(msiPath: string): Promise<number> {
    return tl.tool('msiexec').arg(['/i', msiPath, "/quiet", "/qr", "/L*V", "C:\\Temp\\msilog.log"]).exec();
}

/**
 * Run a tool with `sudo` on Linux and macOS.
 * Precondition: `toolName` executable is in PATH.
 * @returns ToolRunner
 */
function sudo(toolName: string): ToolRunner {
    if (os.platform() === 'win32') {
        return tl.tool(toolName);
    } else {
        const toolPath = tl.which(toolName);
        return tl.tool('sudo').line(toolPath);
    }
}
