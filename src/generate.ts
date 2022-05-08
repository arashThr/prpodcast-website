import fs from 'fs/promises'
import { extname, dirname, join } from 'path'
import { TemplateEngine, PostEngine } from './templates.js'

// Can be more dynamic
let configs = JSON.parse(await fs.readFile('./site/data/configs.json', 'utf-8'))
let episodes = JSON.parse(await fs.readFile('./site/data/episodes.json', 'utf-8'))

const siteData = {
    site: configs.site,
    episodes
}

if (process.argv.length !== 4) {
    console.error('Expecting input and output files')
    process.exit(1)
}

async function writeContent(filePath: string, content: string) {
    const dir = dirname(filePath)
    try {
        await fs.access(dir)
    } catch {
        await fs.mkdir(dir, { recursive: true })
    } finally {
        await fs.writeFile(filePath, content)
    }
}

const inputFile = process.argv[2]
const outputDir = process.argv[3]
const content = await fs.readFile(inputFile, 'utf-8')
// TODO: Engine should return parent class and just call render - type: post | page
if (extname(inputFile) === '.md') {
    const engine = new PostEngine(inputFile)
    await engine.init()
    const [post, postPath] = engine.renderPost(content, siteData)
    await writeContent(join(outputDir, postPath), post)
} else {
    const engine = new TemplateEngine(inputFile)
    await engine.init()
    const rendered = engine.renderHtml(content, siteData)
    await writeContent(join(outputDir, engine.filePath), rendered)
}
