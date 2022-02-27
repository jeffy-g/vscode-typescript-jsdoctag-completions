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
const { window: Window, commands: Commands, languages: Languages, } = vscode;
const pluginJsonMement = (0, util_1.pluginPackageJsonMement)();
/**
 * {@link vscode.StatusBarItem} wrapper
 * @class
 */
class JSDocTagCompletionsStatusBar {
    constructor() {
        this._disposables = [];
        this._command = "jsdoctag-completions.showHelp";
        this._disposables.push(Commands.registerCommand(this._command, async () => {
            const close = { title: "Close", isCloseAffordance: true };
            // @ts-ignore 
            const pluginJson = await pluginJsonMement();
            const message = `Use typescript plugin "${pluginJson.name}"

  version: ${pluginJson.version}
  description: ${pluginJson.description}
  homepage: ${pluginJson.homepage}
`;
            Window.showInformationMessage("JSDoc Tag Completions Extension", { modal: true, detail: message }, close);
        }));
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
                        this._updateForActiveEditor();
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
     * @param {string[]} projectNames currently hosted project names
     * @since 0.5.1
     */
    updateBar(projectNames) {
        const sb = this._statusBar;
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
        const md = `<h4>ℹ️ This plugin hosted${projectCountText} projects:</h4>   \n${(0, util_1.createProjectList4Tooltip)(projectNames)}`;
        const vsmd = new vscode.MarkdownString(md, true);
        vsmd.isTrusted = true;
        vsmd.supportHtml = true;
        sb.tooltip = vsmd;
        sb.color = void 0;
    }
    /**
     * @param [e]
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
        }
        else {
            sb.hide();
        }
    }
}
module.exports = JSDocTagCompletionsStatusBar;