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
        const md = '_Italic_'
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
    })
)

class RenderTest extends TestSuite {
    engine: TemplateEngine

    constructor(
        desc: string,
        public filePath: string = 'template.html') {
            super(desc)
            this.engine = new TemplateEngine(this.filePath)
        }

    setup(): void {
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
        env.engine.includes.set('intro.html', 'Hello')
        const template =
        `%- include intro.html
        <p> Content </p>`
        const rendered = env.engine.renderHtml(template)
        assert.ok(rendered.startsWith('Hello'))
    })
)

class ParsePostTest extends TestSuite {
    dateString = '2022-05-07'
    title = 'new_post'
    filePath: string
    dir = '/content/posts'

    layout = 'episode'
    duration = '1:30'
    size = '100'
    audioUrl = 'https://site.com'
    summary = 'Summary of the post'
    cover = '/img/cover.jpg'

    fms: string
    mds: string
    fullPost: string
    fm: Post.FrontMatter

    constructor(desc: string) {
        super(desc)
        this.filePath = this.dir + '/' + this.dateString + '-' + this.title + '.md'
      
        this.fms =
        `layout: ${this.layout}
        title: ${this.title}
        duration: ${this.duration}
        size: ${this.size}
        audioUrl: ${this.audioUrl}
        summary: ${this.summary}
        cover: ${this.cover}`
       
        this.mds = `# Episode
        %- include sample_include.html
        __Welcome__`
        
        this.fullPost = `---\n${this.fms}\n---\n${this.mds}`
        
        this.fm = {
            layout: this.layout,
            title: this.title,
            duration: this.duration,
            size: this.size,
            summary: this.summary,
            cover: this.cover,
            audioUrl: this.audioUrl,
            date: new Date(this.dateString)
        }
    }
}

let postsTests = new ParsePostTest('Parsing markdowns as posts')

postsTests.runTests(
    testCase('read front matter', (sample) => {
        const fm = Post.parseFrontMatter(sample.fms, new Date(sample.dateString))
        assert.deepEqual(fm, sample.fm)
    }),
    testCase('parse file name', (sample) => {
        const [date, title] = Post.parsePostFileName(sample.filePath)
        assert.deepEqual(date, new Date(sample.dateString))
        assert.equal(title, sample.title)
    }),
    testCase('get sections from raw post', (sample) => {
        const [fms, mds] = Post.getSections(sample.fullPost)
        assert.deepEqual(fms, sample.fms)
        assert.deepEqual(mds, sample.mds)
    }),
    testCase('apply layouts to post', (sample) => {
        const engine = new PostEngine(sample.filePath)
        engine.layouts.set(sample.layout, '${ site.title } ${ post.title } ${ content }')
        engine.includes.set('sample_include.html', 'I am included')
        const [postHtml, postPath] = engine.renderPost(sample.fullPost, { site: { title: 'Site Title' } })

        assert.equal(postHtml, 'Site Title new_post <h1>Episode</h1>\n' +
        'I am included\n' +
        '        <em></em>Welcome<em></em>\n' +
        '\n')
        assert.equal(postPath, 'new_post.html')
    })
)