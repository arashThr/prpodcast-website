export interface FrontMatter {
    layout: string
    title: string,
    duration: string,
    size: string,
    audioUrl: string,
    summary: string,
    cover?: string,
    date: Date,
    path: string,
    // TODO: keywords, everything else
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


export function parseFrontMatter(fms: string, date: Date, postPath: string): FrontMatter {
    const fmm = new Map<string, string>()
    for (let kv of fms
        .split('\n')
        .filter(l => l.trim() != '')
        .map(l => l.split(':').map(p => p.trim()))) {
            fmm.set(kv[0], kv.slice(1).join(':'))
    }

    const getProp = (p: string): string => {
        if (fmm.has(p)) return fmm.get(p) as string
        throw new Error(`${p} not defined`)
    }

    const props: Record<string, string> = 'duration audioUrl title summary layout size'
        .split(' ').reduce((p, c) => Object.assign(p, { [c]: getProp(c)}), {})

    return {
        date,
        title: props.title,
        layout: props.layout,
        duration: props.duration,
        size: props.size,
        summary: props.summary,
        cover: fmm.get('cover'),
        audioUrl: props.audioUrl,
        path: postPath,
    }
}

export function getSections(content: string): [fms: string, mds: string] {
    if (!content.trim().startsWith('---'))
        throw new Error('There is no YAML front matter')
    
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

export function parsePostFileName(fileName: string): [Date, string] {
    const m = fileName.match(/(\d{4}-\d{2}-\d{2})-(.*)\.md/)
    if (!m)
        throw new Error('File name structure is incorrect: yyyy-mm-dd-Title.md')

    const date = m[1]
    const title = m[2]
    return [new Date(date), title]
}
