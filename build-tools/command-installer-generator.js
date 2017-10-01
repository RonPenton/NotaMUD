"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Babylon = require("babylon");
const path = require("path");
const fs = require("fs");
const endsWith = function (str, searchStr, position = 0) {
    if (!(position < str.length))
        position = str.length;
    else
        position |= 0;
    return str.substr(position - searchStr.length, searchStr.length) === searchStr;
};
const location = "src/client/commands/";
const files = getFiles("./" + location);
generateOutputFile(files);
function generateOutputFile(files) {
    const exps = getCommandExportFiles(files);
    let output = "import { install as installCommand } from './index';\n";
    output += "export function install() {\n";
    for (const exp of exps) {
        const module = exp.replace(/\\/g, '/').replace('.tsx', '').replace('.ts', '').replace(location, '');
        output += `    installCommand(require('./${module}').command);\n`;
    }
    output += "}\n";
    fs.writeFile("./src/client/commands/install-commands.ts", output, (err) => { if (err)
        console.log(err); });
}
function getCommandExportFiles(files) {
    return files.filter(f => getCommandExportsFromFile(f).filter(e => e == "command").length > 0);
}
function getCommandExportsFromFile(file) {
    const data = fs.readFileSync(file, { encoding: "UTF8" });
    const ast = Babylon.parse(data, { sourceType: "module", plugins: ["jsx", "typescript"] });
    return getExports(ast.program.body);
}
function getExports(items) {
    return items
        .map(i => getExportNames(i))
        .filter(n => n !== null)
        .reduce((a, i) => a.concat(i), []);
}
function getExportNames(item) {
    switch (item.type) {
        case "ExportNamedDeclaration":
            if (!item.declaration) {
                return item.specifiers.map(x => x.exported.name);
            }
            return getDeclarationName(item.declaration);
        default:
            return null;
    }
}
function getDeclarationName(dec) {
    switch (dec.type) {
        case "FunctionDeclaration":
        case "ClassDeclaration":
            return [dec.id.name];
        case "VariableDeclaration":
            return [dec.declarations[0].id.name];
        default:
            return [];
    }
}
function getFiles(location) {
    const files = fs.readdirSync(location).map(x => {
        const fp = path.join(location, x);
        return { name: fp, stat: fs.statSync(fp) };
    });
    let ts = files.filter(x => isValidFile(x.name)).map(x => x.name);
    const directories = files.filter(x => x.stat.isDirectory());
    const recursed = directories.map(x => getFiles(x.name));
    recursed.forEach(x => ts = ts.concat(x));
    return ts;
}
function isValidFile(name) {
    return endsWith(name, ".ts") || endsWith(name, ".tsx");
}
