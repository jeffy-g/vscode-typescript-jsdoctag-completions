"use strict";
/*!
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  Copyright (C) 2022 jeffy-g <hirotom1107@gmail.com>
  Released under the MIT license
  https://opensource.org/licenses/mit-license.php
 - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
*/
const vscode = require("vscode");
const util_1 = require("./util");
const { window: Window, commands: Commands, languages: Languages } = vscode;
const pluginJsonMement = (0, util_1.pluginPackageJsonMement)();
const showHelp = async () => {
    const close = { title: "Close", isCloseAffordance: true };
    const pluginJson = await pluginJsonMement();
    const detail = `Use typescript plugin "${pluginJson.name}"

version: ${pluginJson.version}
description: ${pluginJson.description}
homepage: ${pluginJson.homepage}
`;
    Window.showInformationMessage("JSDoc Tag Completions Extension", { modal: true, detail }, close);
};
/**
 * {@link vscode.StatusBarItem} wrapper
 * @class
 */
class JSDocTagCompletionsStatusBar {
    constructor() {
        this._disposables = [];
        this._command = "jsdoctag-completions.showHelp";
        this._disposables.push(Commands.registerCommand(this._command, showHelp));
        const sb = Window.createStatusBarItem(vscode.StatusBarAlignment.Right /* , 50000 */);
        sb.command = this._command;
        sb.text = "@JSDocTag";
        sb.tooltip = `"${util_1.PLUGIN_ID}" is not yet loaded...`;
        sb.color = "#ff9373";
        this._statusBar = sb;
        Languages.onDidChangeDiagnostics((e) => {
            let docUri = Window.activeTextEditor?.document.uri;
            if (docUri) {
                for (const uri of e.uris) {
                    if (uri.fsPath === docUri.fsPath) {
                        this._updateForActiveEditor(Window.activeTextEditor);
                        break;
                    }
                }
            }
        }, undefined, this._disposables);
        Window.onDidChangeActiveTextEditor(this._updateForActiveEditor, this, this._disposables);
        setTimeout(() => this._updateForActiveEditor(), 1000);
    }
    dispose() {
        for (const disposable of this._disposables) {
            disposable.dispose();
        }
        this._disposables = [];
        this._statusBar.dispose();
    }
    /**
     * see [TJSDocTagCompionsPluginMessage](https://github.com/jeffy-g/typescript-jsdoctag-completions-plugin-beta/blob/master/lib/communication-api.d.ts#L12,6)
     *
     * @param {{[projectName: string]: TJSDocTagCompionsPluginMessage}} projectRecord currently hosted project map
     * @since 0.5.1
     */
    updateBar(projectRecord) {
        if (!projectRecord) {
            console.log("invalid parameter, need projectRecord object!");
            return;
        }
        this.pr = projectRecord;
        const sb = this._statusBar;
        const projectNames = Object.keys(projectRecord);
        const projectCountText = ` (${projectNames.length})`;
        let text = sb.text;
        const re = / \(\d+\)/;
        if (re.test(text)) {
            text = text.replace(re, projectCountText);
        }
        else {
            text += projectCountText;
        }
        sb.text = text;
        const md = `<h4>ℹ️ This plugin hosted${projectCountText} projects:</h4>   \n${(0, util_1.createProjectList4Tooltip)(projectNames, projectRecord)}`;
        const vsmd = new vscode.MarkdownString(md, true);
        vsmd.isTrusted = true;
        vsmd.supportHtml = true;
        sb.tooltip = vsmd;
        sb.color = void 0;
    }
    /**
     * @param {vscode.TextEditor} [e]
     * @returns
     */
    _updateForActiveEditor(e) {
        const sb = this._statusBar;
        const activeTextEditor = e || Window.activeTextEditor;
        if (!activeTextEditor) {
            sb.hide();
            return;
        }
        if (util_1.LangIDs.includes(activeTextEditor.document.languageId)) {
            sb.show();
            this.updateBar(this.pr);
        }
        else {
            sb.hide();
        }
    }
}
module.exports = JSDocTagCompletionsStatusBar;