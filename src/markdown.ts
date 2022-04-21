// TODO: For future

export function markdown_convert(md: string) {
    return md
        .replaceAll(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replaceAll(/\_(.*?)\_/g, '<em>$1</em>')
        .replaceAll(/\[(.*)\]\((.*)\)/g, '<a href="$2">$1</a>')
}

interface FrontMatter {
    title: string,
    type: 'post' | 'episode'
    duration: string,
    length: number,
    file: string,
    summary?: string,
    cover?: string,
}

export function parse_front_matter(fm: string) {
    const fmo = {}
    for (let parts of fm
        .split('\n')
        .filter(l => l.trim() != '')
        .map(l => l.split('=').map(p => p.trim()))) {
            Object.assign(fmo, {a: parts[1] })
    }
    return fmo
}
