"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * JSDoc Tag Completions PluginId
 */
exports.PLUGIN_ID = "typescript-jsdoctag-completions-plugin";
/**
 * @type {import("vscode").MessageItem}
 */
exports.InfomationOptionOK = {
    title: "OK", isCloseAffordance: true
};
/**
 * extension supported language IDs
 */
exports.LangIDs = [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
];
/**
 * @param {string[]} projectNames
 * @param {Record<string, TJSDocTagCompionsPluginMessage>} projectRecord
 * @returns html supported markdown string
 * @version 1.0
 * @date 2022/2/25
 */
const createProjectList4Tooltip = (projectNames, projectRecord) => {
    let contents = "";
    const re = /\/[^\/]+\/[^\/]+$/g;
    for (let i = 0; i < projectNames.length;) {
        const pname = projectNames[i++];
        const pm = projectRecord[pname];
        if (!pname.startsWith("/dev")) {
            re.lastIndex = 0;
            const m = re.exec(pname);
            contents += `<div title="${pname}">$(check) [${pm.locale}] &lt;omited dirs>${m[0]}</div>\n`;
        }
        else {
            contents += `<div title="no project config">$(question) [${pm.locale}] ${pname}</div>\n`;
        }
    }
    return contents;
};
exports.createProjectList4Tooltip = createProjectList4Tooltip;
function pluginPackageJsonMement() {
    /** @type {Record<string, any>} */
    let pkgJson;
    return async () => {
        if (pkgJson === void 0) {
            // @ts-ignore 
            pkgJson = await Promise.resolve().then(() => require("typescript-jsdoctag-completions-plugin/package.json"));
        }
        return pkgJson;
    };
}
exports.pluginPackageJsonMement = pluginPackageJsonMement;