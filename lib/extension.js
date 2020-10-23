"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2020 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
const vscode = require("vscode");
const StatusBar = require("./status-bar");
const util_1 = require("./util");
const c = require("typescript-jsdoctag-completions-plugin/lib/communication");
const DEBUG = 1;
const configSectionName = "jsdoctag-completions";
const vscodeTsLanguageFeatureId = "vscode.typescript-language-features";
/**
 * @typedef ApiV0
 * @prop {<T>(pluginId: string, configuration: T) => void} configurePlugin
 */
/**
 * @typedef Api
 * @prop {(version: 0) => ApiV0 | undefined} getAPI
 */
/**
 * @param {ApiV0} api this `api` is vscode.typescript-language-features exposed API,
 *     more dtails see {@link https://github.com/microsoft/vscode/blob/master/extensions/typescript-language-features/src/api.ts typescript-language-features API}
 */
function synchronizeConfiguration(api) {
    const config = vscode.workspace.getConfiguration(configSectionName);
    if (api) {
        api.configurePlugin(util_1.PLUGIN_ID, config);
    }
    else {
        vscode.window.showInformationMessage(`${vscodeTsLanguageFeatureId}, ApiV0 is not available, api=${api}`, util_1.InfomationOptionOK);
    }
}
const serverLogger  = {
    channel: vscode.window.createOutputChannel("JSDoc Tag Completion"),
    log(text) {
        this.channel.appendLine(text);
    }
};
/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    /** @type {vscode.Extension<Api> | undefined} */
    const extension = vscode.extensions.getExtension(vscodeTsLanguageFeatureId);
    /** @type {string | undefined} */
    let errorMessage;
    /** @type {ApiV0 | undefined} */
    let api;
    if (!extension) {
        errorMessage = `${vscodeTsLanguageFeatureId} is unavailable...`;
    }
    else {
        await extension.activate();
        if (!extension.exports || !extension.exports.getAPI) {
            errorMessage = `${vscodeTsLanguageFeatureId}, getAPI is unavailable`;
        }
        else {
            api = extension.exports.getAPI(0);
            if (!api) {
                errorMessage = `${vscodeTsLanguageFeatureId}, getAPI is failed...`;
            }
        }
    }
    if (errorMessage) {
        vscode.window.showInformationMessage(errorMessage, util_1.InfomationOptionOK);
        throw new Error('Could not activate "vscode-typescript-jsdoctag-completions" extension');
    }
    const bar = new StatusBar();
    /** @type {Record<string, TJSDocTagCompionsPluginMessage>} */
    const projects = {};
    c.launchMessageServer((msg ) => {
        const isClosed = msg.closed;
        if (DEBUG) {
            const json = JSON.stringify(msg, null, 2);
            const content = `Project ${isClosed ? "closed" : msg.reload ? "reload" : "found!"} - ${json}`;
            console.log(content);
        }
        if (isClosed) {
            delete projects[msg.projectName];
        }
        else {
            projects[msg.projectName] = msg;
        }
        bar.updateBar(Object.keys(projects));
    }, serverLogger);
    context.subscriptions.push(bar);
    synchronizeConfiguration(api);
    vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration(configSectionName)) {
            vscode.window.showInformationMessage(`${configSectionName} setting changes detected`, util_1.InfomationOptionOK);
            synchronizeConfiguration(api);
        }
    }, undefined, context.subscriptions);
}
exports.activate = activate;