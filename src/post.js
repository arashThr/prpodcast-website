/**
 * Converts markdown to HTML.
 * 
 * @param {string} md - The markdown string to convert.
 * @returns {string} - The converted HTML string.
 */
export function convertMarkdown(md) {
    return md
        .replaceAll(/\!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
        .replaceAll(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replaceAll(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replaceAll(/\*(.*?)\*/g, '<em>$1</em>')
        .replaceAll(/^\s*# (.*)/g, '<h1>$1</h1>')
        .replaceAll(/^\s*## (.*)/g, '<h2>$1</h2>')
        .replaceAll(/^\s*### (.*)/g, '<h3>$1</h3>')
}


/**
 * @param {string} fms
 * @param {string} publishDate
 * @param {string} url
 * @returns {FrontMatter}
 */
export function parseFrontMatter(fms, publishDate, url) {
    const fmm = new Map()
    for (let kv of fms
        .split('\n')
        .filter(l => l.trim() != '')
        .map(l => l.split(':').map(p => p.trim()))) {
            fmm.set(kv[0], kv.slice(1).join(':'))
    }
    
    const layout = fmm.get('layout')
    const title = fmm.get('title')
    if (!layout || !title) {
        console.error('Some required fields are missing from FrontMatter', fms)
        throw new Error('Missing fields')
    }
    const fm = {
        layout, title, url, publishDate
    }
    for (let [k, v] of fmm.entries())
        fm[k] = v

    return fm
}

/**
 * Extracts the front matter and markdown sections from the content.
 * 
 * @param {string} content - The content string to parse.
 * @returns {[string, string]} - An array containing the front matter string and the markdown string.
 */
export function getSections(content) {
    if (!content.trim().startsWith('---'))
        throw new Error('There is no YAML front matter: ' + content)

    let fms = ''
    let mds = ''
    let isFm = false
    let isMd = false
    for (let l of content.split('\n')) {
        if (l.trim().startsWith('---')) {
            isFm = isFm ? false : true
            if (!isFm) isMd = true
        }
        else if (isFm)
            fms += l + '\n'
        else if (isMd)
            mds += l + '\n'
        else
            throw new Error('Front matter parse failed')
    }

    return [fms.trim(), mds.trim()]
}

/**
 * Parses the post file name to extract the date and title.
 * 
 * @param {string} fileName - The file name to parse.
 * @returns {[string, string]} - An array containing the date and title.
 */
export function parsePostFileName(fileName) {
    const m = fileName.match(/(\d{4}-\d{2}-\d{2})-(.*)\.md/)
    if (!m)
        throw new Error('File name structure is incorrect: yyyy-mm-dd-Title.md')

    const date = m[1]
    const title = m[2]
    return [date, title]
}
