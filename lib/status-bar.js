"use strict";
const vscode = require("vscode");
const util_1 = require("./util");
const pluginMement = (0, util_1.pluginPackageJsonMement)();
/**
 * {@link vscode.StatusBarItem} wrapper
 * @class
 */
class JSDocTagCompletionsStatusBar {
    constructor() {
        this._disposables = [];
        this._command = "jsdoctag-completions.showHelp";
        this._disposables.push(vscode.commands.registerCommand(this._command, async () => {
            const close = { title: "Close", isCloseAffordance: true };
            // @ts-ignore 
            const pluginJson = await pluginMement();
            const message = `Use typescript plugin "${pluginJson.name}"

  version: ${pluginJson.version}
  description: ${pluginJson.description}
  homepage: ${pluginJson.homepage}
`;
            vscode.window.showInformationMessage(message, { modal: true }, close);
        }));
        const sb = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right /* , 50000 */);
        sb.command = this._command;
        sb.text = "@JSDocTag";
        sb.tooltip = `"${util_1.PLUGIN_ID}" is not yet loaded...`;
        sb.color = "#ff9373";
        this._statusBar = sb;
        vscode.languages.onDidChangeDiagnostics((e) => {
            let docUri = vscode.window.activeTextEditor?.document.uri;
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
        const md = `<h4>ℹ️ This plugin hosted${projectCountText} projects:</h4>   \n${(0, util_1.createProjectList4Tooltip)(projectNames)}`;
        const vsmd = new vscode.MarkdownString(md, true);
        vsmd.isTrusted = true;
        vsmd.supportHtml = true;
        sb.tooltip = vsmd;
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