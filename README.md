[![DeepScan grade](https://deepscan.io/api/teams/3135/projects/20944/branches/587729/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=3135&pid=20944&bid=587729)
![GitHub](https://img.shields.io/github/license/jeffy-g/vscode-typescript-jsdoctag-completions?style=flat)

> # JSDoc Tag Completions extension For VS Code

Integrates [typescript-jsdoctag-completions-plugin](https://github.com/jeffy-g/typescript-jsdoctag-completions-plugin-beta) into VS Code.

 - Load `typescript-jsdoctag-completions-plugin` as `global plugin`.

 - Loaded as `global plugin`, it allows jsdoc tag completion when editing all `typescript/javascript` related sources opened in vscode.

## Settings Options

This extension contributes the following variables to the [settings](https://code.visualstudio.com/docs/customization/userandworkspace):

 * `jsdoctag-completions.locale`  
  If locale is not set in the typescript project, it will be forced this value or native OS locale.  
  `locale` value is the same as **typescript** `compilerOptions.locale`.

 * `jsdoctag-completions.preset`  
  choose builtin preset (`default`, `closure`) or specify preset module path.  
  `default` preset is **typescript** builtin jsdoc tags with additional [jsdoc.app](https://jsdoc.app/) inline tag.

 * `jsdoctag-completions.verbose`  
  enable/disable debug log to tsserver log file.


## Locale priority

  + The priority to which the `locale` applies

    * 1 ts project (tsconfig.json etc)

    * 2 vscode setting (this extension `jsdoctag-completions.locale`)

    * 3 OS native

### TIP

 - `typescript-jsdoctag-completions-plugin` requires module `tsserverlibrary`, but it is not included `vscode` builtin `typescript`,  
   so use the [Select TypeScript Version](https://code.visualstudio.com/docs/typescript/typescript-compiling#_using-the-workspace-version-of-typescript) command to switch to workspace's typescript, etc. need to do it.

   * Recommended to install the [JavaScript and TypeScript Nightly](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next) extension

 - You can change `locale` and `preset` individually by setting plugin config for each `(ts|js)config.json`.

```jsonc
{
  "compilerOptions": {
    "target": "es2019",
    "module": "esnext",
    "strict": true,
    // In TypeScript 5.x, compilerOptions/locale was removed,
    // so Moved locale to plugin settings.
    // however, for older versions of ts,
    // this value is still referenced as before from this plugin.
    // "locale": "ja",
    "plugins": [
      {
        "name": "typescript-jsdoctag-completions-plugin",
        // Plugin specific configuration
        // builtin preset is "default" and "closure".
        // If you want to use a jsdoc tag preset that you have defined yourself based on the preset API,
        // specify the path of that module.
        "preset": "closure",
        "verbose": true,     // enable/disable plugin logging
        // plugin refers to the value of `@compilerOptions/plugins[@name=typescript-jsdoctag-completions-plugin]/locale`
        // If not set, use the OS locale
        "locale": "ja"
      }
    ]
  }
}
```
