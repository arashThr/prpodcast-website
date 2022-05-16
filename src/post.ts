export type FrontMatter = {
    [k: string]: string | undefined
    layout: string
    title: string
    publishDate: string
    url: string
}

export function convertMarkdown(md: string) {
    return md
        .replaceAll(/\!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
        .replaceAll(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
        .replaceAll(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replaceAll(/\*(.*?)\*/g, '<em>$1</em>')
        .replaceAll(/^\s*# (.*)/g, '<h1>$1</h1>')
        .replaceAll(/^\s*## (.*)/g, '<h2>$1</h2>')
        .replaceAll(/^\s*### (.*)/g, '<h3>$1</h3>')
}

export function parseFrontMatter(fms: string, publishDate: string, url: string): FrontMatter {
    const fmm = new Map<string, string>()
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
    const fm: FrontMatter = {
        layout, title, url, publishDate
    }
    for (let [k, v] of fmm.entries())
        fm[k] = v

    return fm
}

export function getSections(content: string): [fms: string, mds: string] {
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

export function parsePostFileName(fileName: string): [string, string] {
    const m = fileName.match(/(\d{4}-\d{2}-\d{2})-(.*)\.md/)
    if (!m)
        throw new Error('File name structure is incorrect: yyyy-mm-dd-Title.md')

    const date = m[1]
    const title = m[2]
    return [date, title]
}
