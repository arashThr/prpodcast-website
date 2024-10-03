import * as Post from './post.js'
import * as fs from "fs/promises"
import { join, basename, dirname, extname } from 'path'

/**
 * Escapes XML special characters in a string.
 * @param {string} text - The text to escape.
 * @returns {string} - The escaped text.
 */
function xmlEscape(text) {
    const escapes = {
        '"': '&quot',
        "'": '&apos',
        '<': '&lt',
        '>': '&gt',
        '&': '&amp'
    }
    const re = new RegExp('[' + Object.keys(escapes).join('') + ']', 'g')
    return text.toString().replace(re, (c) => escapes[c])
}

/**
 * Recursively gets all files in a directory.
 * @param {string} dir - The directory to search.
 * @returns {Promise<string[]>} - A promise that resolves to an array of file paths.
 */
async function getFiles(dir) {
    let files = []
    for (let f of await fs.readdir(dir)) {
        const path = join(dir, f)
        let fileStat = await fs.stat(path)
        if (fileStat.isDirectory())
            files.push(...await getFiles(path))
        else
            files.push(path)
    }
    return files
}

export class TemplateEngine {
    /**
     * @param {string} filePath - The file path.
     */
    constructor(filePath) {
        // Remove "site/dir" directory from the path
        this.filePath = join(...filePath.split('/').slice(3))
        this.includes = new Map()
    }

    async init() {
        const includeFiles = await getFiles('./site/include')
        for (let f of includeFiles) {
            const content = await fs.readFile(f, 'utf-8')
            this.includes.set(basename(f), content)
        }
    }

    /**
     * Renders HTML from a template and site data.
     * @param {string} template - The template string.
     * @param {object} [siteData={}] - The site data.
     * @returns {string} - The rendered HTML.
     */
    renderHtml(template, siteData = {}) {
        let args = Object.keys(siteData).join()
        let params = Object.values(siteData)

        let code = `const xmlEscape = ${xmlEscape.toString()};
        return (${args}) => { let output = '';\n`

        for (let l of template.split('\n')) {
            if (l.match(/^\s*% (.*)/)) {
                code += l.includes('% include')
                    ? this.addIncludedHtml(l, siteData)
                    : l.trim().slice(1) + '\n'
            } else {
                code += 'output += `' + l + '\\n`;\n'
            }
        }

        code += 'return output; }'
        let func = Function(code)()
        return func(...params)
    }

    /**
     * Adds included HTML to the output.
     * @param {string} l - The line containing the include directive.
     * @param {object} siteData - The site data.
     * @returns {string} - The code to include the HTML.
     */
    addIncludedHtml(l, siteData) {
        let m = l.match(/% include (\S+.html)/)
        if (!m) throw new Error('"Include" matching failed: ' + l)
        const template = this.includes.get(m[1])
        if (!template) throw new Error(`${m[1]} template not found`)
        const renderedTemplate = this.renderHtml(template, siteData)
        return 'output += `' + renderedTemplate + '\\n`;\n'
    }
}

/**
 * `PostEngine` is just `TemplateEngine` that also applies __layouts__
 */
export class PostEngine extends TemplateEngine {
    /**
     * @param {string} filePath - The file path.
     * @param {boolean} [updateCache=true] - Whether to update the cache.
     */
    constructor(filePath, updateCache = true) {
        super(filePath)
        this.updateCache = updateCache
        this.layouts = new Map()
    }

    async init() {
        await super.init()
        const layoutFiles = (await getFiles('./site/layout')).filter(f => extname(f) === '.html')
        let p = []
        for (let f of layoutFiles) {
            p.push(new Promise(resolve => {
                resolve(fs.readFile(f, 'utf-8'))
            }).then(content => {
                this.layouts.set(basename(f, '.html'), content)
            }))
        }
        await Promise.all(p)
    }

    /**
     * Gets the layout by name.
     * @param {string} layoutName - The layout name.
     * @returns {string} - The layout content.
     */
    getLayout(layoutName) {
        const layout = this.layouts.get(layoutName)
        if (!layout) throw new Error(`${layoutName} layout is undefined`)
        return layout
    }

    /**
     * Renders a post with the given content and site data.
     * @param {string} content - The post content.
     * @param {object} siteData - The site data.
     * @returns {[string, FrontMatter, string]} - The rendered post HTML, post data, and post path.
     */
    renderPost(content, siteData) {
        const [date, fileName] = Post.parsePostFileName(this.filePath)
        const url = join(dirname(this.filePath), fileName)
        const [fms, postTemplate] = Post.getSections(content)
        const postData = Post.parseFrontMatter(fms, date, fileName)

        // TODO: Apply markdowns
        // const postTemplate = Post.convertMarkdown(mds)

        let data = Object.assign({post: postData}, siteData)
        const postHtml = this.renderHtml(postTemplate, data)

        data = Object.assign({content: postHtml}, data)
        const layout = this.getLayout(postData.layout)
        const fullHtml = this.renderHtml(layout, data)

        return [fullHtml, postData, url + '.html']
    }
}
