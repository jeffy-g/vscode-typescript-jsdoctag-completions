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
const CONFIG_SECTION_NAME = "jsdoctag-completions";
const VSCODE_TSLANGUAGE_FEATUREID = "vscode.typescript-language-features";
const { window: Window, workspace: Workspace } = vscode;
/**
 * @typedef ApiV0
 * @prop {<T>(pluginId: string, configuration: T) => void} configurePlugin
 */
/**
 * @typedef Api
 * @prop {(version: 0) => ApiV0 | undefined} getAPI
 */
/**
 * @param {ApiV0} api0 this `api` is vscode.typescript-language-features exposed API,
 *     more dtails see {@link https://github.com/microsoft/vscode/blob/master/extensions/typescript-language-features/src/api.ts typescript-language-features API}
 */
function synchronizeConfiguration(api0) {
    if (typeof api0 === "object" && typeof api0.configurePlugin === "function") {
        api0.configurePlugin(util_1.PLUGIN_ID, Workspace.getConfiguration(CONFIG_SECTION_NAME));
    }
    else {
        Window.showInformationMessage(`${VSCODE_TSLANGUAGE_FEATUREID}, ApiV0 is not available, api=${api0}`, util_1.InfomationOptionOK);
    }
}
const serverLogger  = {
    channel: Window.createOutputChannel("JSDoc Tag Completion"),
    log(text) {
        this.channel.appendLine(text);
    }
};
/**
 * @returns {Promise<ApiV0 | undefined>}
 */
async function getApiV0() {
    /** @type {vscode.Extension<Api> | undefined} */
    const tsLangExtension = vscode.extensions.getExtension(VSCODE_TSLANGUAGE_FEATUREID);
    /** @type {ApiV0 | undefined} */
    let api0;
    /** @type {string | undefined} */
    let errorMessage;
    if (!tsLangExtension) {
        errorMessage = `${VSCODE_TSLANGUAGE_FEATUREID} is unavailable...`;
    }
    else {
        await tsLangExtension.activate();
        const { exports } = tsLangExtension;
        if (!exports || !exports.getAPI) {
            errorMessage = `${VSCODE_TSLANGUAGE_FEATUREID}, getAPI is unavailable`;
        }
        else {
            api0 = exports.getAPI(0);
            if (!api0) {
                errorMessage = `${VSCODE_TSLANGUAGE_FEATUREID}, getAPI is failed...`;
            }
        }
    }
    if (errorMessage) {
        Window.showInformationMessage(errorMessage, util_1.InfomationOptionOK);
        throw new Error('Could not activate "vscode-typescript-jsdoctag-completions" extension');
    }
    return api0;
}
/**
 * @param {vscode.ExtensionContext} context
 */
async function activate(context) {
    /** @type {ApiV0 | undefined} */
    const api0 = await getApiV0();
    if (api0) {
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
        synchronizeConfiguration(api0);
        Workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration(CONFIG_SECTION_NAME)) {
                Window.showInformationMessage(`${CONFIG_SECTION_NAME} setting changes detected`, util_1.InfomationOptionOK);
                synchronizeConfiguration(api0);
            }
        }, undefined, context.subscriptions);
    }
}
exports.activate = activate;