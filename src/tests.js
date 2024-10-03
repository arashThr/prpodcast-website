import assert from 'assert';
import * as Post from './post.js'
import { PostEngine, TemplateEngine } from './templates.js'
import { TestSuite, testCase } from './testing.js'

class MarkdownTest extends TestSuite { }

let markdown = new MarkdownTest('Test Markdown')

markdown.runTests(
    testCase('Bold conversion', () => {
        const md = '**STRONG!**'
        const html = Post.convertMarkdown(md)
        assert.equal(html, '<strong>STRONG!</strong>')
    }),
    testCase('Italic conversion', () => {
        const md = '*Italic*'
        const html = Post.convertMarkdown(md)
        assert.equal(html, '<em>Italic</em>')
    }),
    testCase('Link conversion', () => {
        const md = '[Link](https://example.com)'
        const html = Post.convertMarkdown(md)
        assert.equal(html, '<a href="https://example.com">Link</a>')
    }),
    testCase('Headers', () => {
        assert.equal(Post.convertMarkdown('# Title1'), '<h1>Title1</h1>')
        assert.equal(Post.convertMarkdown('## Title2'), '<h2>Title2</h2>')
        assert.equal(Post.convertMarkdown('### Title3'), '<h3>Title3</h3>')
    }),
    testCase('Links', () => {
        assert.equal(Post.convertMarkdown('[link](https://example.com)'), '<a href="https://example.com">link</a>', 'Page links')
        assert.equal(Post.convertMarkdown('![link](/image.png)'), '<img src="/image.png" alt="link">', 'Image links')
    })
)

class RenderTest extends TestSuite {
    /**
     * @param {string} desc
     * @param {string} [filePath='template.html']
     */
    constructor(desc, filePath = 'template.html') {
        super(desc)
        this.filePath = filePath
        this.engine = new TemplateEngine(this.filePath)
    }

    setup() {
        this.engine = new TemplateEngine(this.filePath)
    }
}

const templateTests = new RenderTest('Template engine')

templateTests.runTests(
    testCase('Simple lines should appear the same', (env) => {
        assert.equal(env.engine.renderHtml('Hello').trim(), 'Hello')
    }),
    testCase('Variable substitution', (env) => {
        assert.equal(env.engine.renderHtml('Hello ${name}', {name: 'Arash'}).trim(), 'Hello Arash')
    }),
    testCase('Multiple variable substitution', (env) => {
        assert.equal(env.engine.renderHtml('Hello ${name} with age ${ age }', {name: 'John', age: 100}), 'Hello John with age 100\n')
    }),
    testCase('If condition', (env) => {
        const template =
        `% if (num > 0) {
        num more than 0
        % } else {
        num less than 0
        % }`
        assert.equal(env.engine.renderHtml(template, {num: 1}).trim(), 'num more than 0')
        assert.equal(env.engine.renderHtml(template, {num: -1}).trim(), 'num less than 0')
    }),
    testCase('For loop', (env) => {
        const template =
        `% for (let i of nums)
        \${i}`
        assert.equal(env.engine.renderHtml(template, {nums: [1,2,3]}).replaceAll(/\s/g, ''), "123")
    }),
    testCase('For loop on objects', (env) => {
        const template =
        `% for (let p of people) {
        \${p.name}|
        \${p.age}-
        % }`
        const data = { people: [{name: 'A', age: 10}, {name: 'B', age: 20}] }
        assert.equal(env.engine.renderHtml(template, data).replaceAll(/\s/g, ''), 'A|10-B|20-')
    }),
    testCase('Include html into page', (env) => {
        env.engine.includes.set('intro.html', '% for (let i of [0, 1]) {\n' +
            '${i} ${words[i]}\n% }')
        const template =
        `% include intro.html
        <p> Content </p>`
        const rendered = env.engine.renderHtml(template, {words: ['zero', 'one']})
        assert.equal(rendered, '0 zero\n1 one\n\n        <p> Content </p>\n')
    })
)

class ParsePostTest extends TestSuite {
    /**
     * @param {string} desc
     */
    constructor(desc) {
        super(desc)
        this.filePath = this.dir + '/' + this.dateString + '-' + this.postPath + '.md'

        this.dateString = '2022-05-07'
        this.title = 'Post Title'
        this.filePath
        this.dir = '/content/posts'

        this.layout = 'episode'
        this.duration = '1:30'
        this.size = '100'
        this.audioUrl = 'https://site.com'
        this.summary = 'Summary of the post'
        this.cover = '/img/cover.jpg'
        this.postPath = 'my_post'

        this.fms =
        `layout: ${this.layout}
        title: ${this.title}
        duration: ${this.duration}
        size: ${this.size}
        audioUrl: ${this.audioUrl}
        summary: ${this.summary}
        cover: ${this.cover}`

        this.mds = `# Episode
        % include sample_include.html
        **Welcome**`

        this.fullPost = `---\n${this.fms}\n---\n${this.mds}`

        /** @type {FrontMatter} */
        this.fm = {
            layout: this.layout,
            title: this.title,
            duration: this.duration,
            size: this.size,
            summary: this.summary,
            cover: this.cover,
            audioUrl: this.audioUrl,
            publishDate: this.dateString,
            url: this.postPath,
        }
    }
}

let postsTests = new ParsePostTest('Parsing markdowns as posts')

postsTests.runTests(
    testCase('Parse post file name', (sample) => {
        const [date, postPath] = Post.parsePostFileName(sample.filePath)
        assert.equal(date, sample.dateString)
        assert.equal(postPath, sample.postPath)
    }),
    testCase('Read front matter', (sample) => {
        const fm = Post.parseFrontMatter(sample.fms, sample.dateString, sample.postPath)
        assert.deepEqual(fm, sample.fm)
    }),
    testCase('get sections from raw post', (sample) => {
        const [fms, mds] = Post.getSections(sample.fullPost)
        assert.equal(fms, sample.fms)
        assert.equal(mds, sample.mds)
    }),
    testCase('apply layouts to post', (sample) => {
        const engine = new PostEngine(sample.filePath, false)
        engine.layouts.set(sample.layout, '${ site.title } ${ post.title } ${ content }')
        engine.includes.set('sample_include.html', 'I am included')
        const [postHtml, postData, postPath] = engine.renderPost(sample.fullPost, { site: { title: 'Site Title' } })

        assert.equal(postHtml, 'Site Title Post Title # Episode\nI am included\n\n        **Welcome**\n\n')
        assert.equal(postData.publishDate, sample.dateString)
        assert.equal(postPath, 'my_post.html')
    })
)
