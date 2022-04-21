function xmlEscape(text: string) {
    const escapes: { [ k: string]: string } = {
        '"': '&quot',
        "'": '&apos',
        '<': '&lt',
        '>': '&gt',
        '&': '&amp'
    }
    const re = new RegExp('[' + Object.keys(escapes).join('') + ']', 'g')
    return text.toString().replace(re, (c) => escapes[c])
}

export function render(template: string, data: object = {}) {
    let args = Object.keys(data).join()
    let params = Object.values(data)

    let code = `const xmlEscape = ${xmlEscape.toString()};
    return (${args}) => { let output = '';\n`
    for (let l of template.split('\n')) {
        if (l.trim().startsWith('%')) {
            code += l.trim().slice(1) + '\n'
        } else {
            code += 'output += `' + l + '\\n`;\n'
        }
    }
    code += 'return output; }'
    let func = Function(code)()
    return func(...params)
}
