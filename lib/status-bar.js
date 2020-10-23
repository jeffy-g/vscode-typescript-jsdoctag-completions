"use strict";
const vscode = require("vscode");
const util_1 = require("./util");
/**
 * {@link https://code.visualstudio.com/api/references/vscode-api#StatusBarItem vscode.StatusBarItem} wrapper
 * @class
 */
class JSDocTagCompletionsStatusBar {
    constructor() {
        this._disposables = [];
        this._command = "jsdoctag-completions.showHelp";
        this._disposables.push(vscode.commands.registerCommand(this._command, async () => {
            const close = { title: "Close", isCloseAffordance: true };
            vscode.window.showInformationMessage(this._statusBar.tooltip, close);
        }));
        const sb = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right /* , 50000 */);
        sb.command = this._command;
        sb.text = "@JSDocTag";
        sb.tooltip = `"${util_1.PLUGIN_ID}" is not yet loaded...`;
        sb.color = "#ff9373";
        this._statusBar = sb;
        vscode.languages.onDidChangeDiagnostics((e) => {
            var _a;
            let docUri = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri;
            if (!docUri) {
                return;
            }
            for (const uri of e.uris) {
                if (uri.fsPath === docUri.fsPath) {
                    this._updateForActiveEditor();
                    break;
                }
            }
        }, undefined, this._disposables);
        vscode.window.onDidChangeActiveTextEditor(this._updateForActiveEditor, this, this._disposables);
        this._updateForActiveEditor();
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
        sb.tooltip = `This plugin hosted${projectCountText} projects:\n${projectNames.join("\n")}`;
        sb.color = void 0;
    }
    _updateForActiveEditor() {
        const sb = this._statusBar;
        const activeTextEditor = vscode.window.activeTextEditor;
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