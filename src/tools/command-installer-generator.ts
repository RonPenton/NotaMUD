import * as Babylon from 'babylon'
import * as Babel from 'babel-types'
import * as path from 'path'
import * as fs from 'fs'

const endsWith = function (str: string, searchStr: string, position: number = 0) {
    if (!(position < str.length)) position = str.length;
    else position |= 0;
    return str.substr(position - searchStr.length, searchStr.length) === searchStr;
};

const location = "src/client/commands/"
const files = getFiles("./" + location);
generateOutputFile(files);

function generateOutputFile(files: string[]) {
    const exps = getCommandExportFiles(files);
    let output = "import { install as installCommand } from './index';\n";
    output += "export function install() {\n";
    for (const exp of exps) {
        const module = exp.replace(/\\/g, '/').replace('.tsx', '').replace('.ts', '').replace(location, '');
        output += `    installCommand(require('./${module}').command);\n`;
    }
    output += "}\n";

    fs.writeFile("./src/client/commands/install-commands.ts", output, (err) => { if (err) console.log(err) });
}

function getCommandExportFiles(files: string[]): string[] {
    return files.filter(f => getCommandExportsFromFile(f).filter(e => e == "command").length > 0);
}

function getCommandExportsFromFile(file: string): string[] {
    const data = fs.readFileSync(file, { encoding: "UTF8" });
    const ast = Babylon.parse(data, { sourceType: "module", plugins: ["jsx", "typescript" as any] });
    return getExports(ast.program.body);
}

function getExports(items: Array<Babel.Statement | Babel.ModuleDeclaration>): string[] {
    return items
        .map(i => getExportNames(i))
        .filter(n => n !== null)
        .reduce((a, i) => a!.concat(i!), [])!;
}

function getExportNames(item: Babel.Statement | Babel.ModuleDeclaration): string[] | null {
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

function getDeclarationName(dec: Babel.Declaration): string[] {
    switch (dec.type) {
        case "FunctionDeclaration":
        case "ClassDeclaration":
            return [dec.id.name];

        case "VariableDeclaration":
            return [(dec.declarations[0].id as Babel.Identifier).name];

        default:
            return [];
    }
}

function getFiles(location: string): string[] {
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

function isValidFile(name: string): boolean {
    return endsWith(name, ".ts") || endsWith(name, ".tsx");
}