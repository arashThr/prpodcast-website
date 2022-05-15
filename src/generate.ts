import fs from 'fs/promises'
import { dirname, join } from 'path'
import { TemplateEngine, PostEngine } from './templates.js'

// Can be more dynamic
let configs = JSON.parse(await fs.readFile('./site/configs.json', 'utf-8'))

const postsCacheFile = '.posts_cache.json'

const cacheFile = await fs.open(postsCacheFile, 'a+')
type PostData = {
    [key: string]: string
}
const postsData = JSON.parse(await cacheFile.readFile('utf-8') || '{}')
const posts: PostData[] = Object.values(postsData)

const siteData = {
    site: configs.site,
    posts: posts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

if (process.argv.length !== 5) {
    console.error('Expecting: [post|page] inputFile outputFiles')
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

const docType = process.argv[2].toLowerCase()
const inputFile = process.argv[3]
const outputDir = process.argv[4]
let content = await fs.readFile(inputFile, 'utf-8')
content = content.replaceAll('`', '\\`')
// TODO: Engine should return parent class and just call render - type: post | page
if (docType === 'post') {
    const engine = new PostEngine(inputFile)
    await engine.init()
    const [post, postData, postPath] = engine.renderPost(content, siteData)
    await writeContent(join(outputDir, postPath), post)
    postsData[postPath] = postData
    await fs.writeFile(postsCacheFile, JSON.stringify(postsData, null, 4))
} else if (docType === 'page') {
    const engine = new TemplateEngine(inputFile)
    await engine.init()
    const rendered = engine.renderHtml(content, siteData)
    await writeContent(join(outputDir, engine.filePath), rendered)
} else {
    throw new Error ('Unknown doc type: ' + docType)
}

