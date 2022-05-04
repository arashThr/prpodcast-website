import { readFile, readdir, stat } from "fs/promises"
import { join, basename } from 'path'

function xmlEscape(text: string) {
    const escapes: { [k: string]: string } = {
        '"': '&quot',
        "'": '&apos',
        '<': '&lt',
        '>': '&gt',
        '&': '&amp'
    }
    const re = new RegExp('[' + Object.keys(escapes).join('') + ']', 'g')
    return text.toString().replace(re, (c) => escapes[c])
}

async function getFiles(dir: string): Promise<string[]> {
    let files: string[] = []
    for (let f of await readdir(dir)) {
        const path = join(dir, f)
        let fileStat = await stat(path)
        if (fileStat.isDirectory())
            files.push(...await getFiles(path))
        else
            files.push(path)
    }
    return files
}

export class TemplateEngine {
    includes: Map<string, string> = new Map()

    async init() {
        const includeFiles = await getFiles('./site/include')
        for (let f of includeFiles) {
            const content = await readFile(f, 'utf-8')
            this.includes.set(basename(f), content)
        }
    }

    render(template: string, data: object = {}): string {
        let args = Object.keys(data).join()
        let params = Object.values(data)

        let code = `const xmlEscape = ${xmlEscape.toString()};
        return (${args}) => { let output = '';\n`
        for (let l of template.split('\n')) {
            if (l.match(/^\s*%-/)) {
                let m = l.match(/%- include (\S*)/)
                if (!m) throw new Error('INCLUDE matching failed: ' + l)
                code += 'output += `' + this.includes.get(m[1]) + '\\n`;\n'
            }
            else if (l.match(/^\s*%/))
                code += l.trim().slice(1) + '\n'
            else
                code += 'output += `' + l + '\\n`;\n'
        }
        code += 'return output; }'
        let func = Function(code)()
        return func(...params)
    }
}
