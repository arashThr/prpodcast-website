import fs from 'fs/promises'
import { render } from './templates.js'

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

const input = process.argv[2]
const output = process.argv[3]
const content = await fs.readFile(input, 'utf-8')
await fs.writeFile(output, render(content, siteData))