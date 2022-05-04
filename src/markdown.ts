export function convertMarkdown(md: string) {
    return md
        .replaceAll(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replaceAll(/\_(.*?)\_/g, '<em>$1</em>')
        .replaceAll(/\[(.*)\]\((.*)\)/g, '<a href="$2">$1</a>')
        .replaceAll(/^\s*# (.*)/g, '<h1>$1</h1>')
        .replaceAll(/^\s*## (.*)/g, '<h2>$1</h2>')
        .replaceAll(/^\s*### (.*)/g, '<h3>$1</h3>')
}

export interface FrontMatter {
    layout: string
    title: string,
    duration: string,
    size: string,
    audioUrl: string,
    summary: string,
    cover?: string,
}

export function parseFrontMatter(fms: string): FrontMatter {
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

    const props: Record<string, string> = 'title duration audioUrl summary cover layout size'
        .split(' ').reduce((p, c) => Object.assign(p, { [c]: getProp(c)}), {})

    return {
        layout: props.layout,
        title: props.title,
        duration: props.duration,
        size: props.size,
        summary: props.summary,
        cover: props.cover,
        audioUrl: props.audioUrl
    }
}
