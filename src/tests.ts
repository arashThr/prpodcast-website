import assert from 'assert';
import { markdown_convert as convert } from './markdown.js'
import { TemplateEngine } from './templates.js'
import { TestSuite, testCase } from './testing.js'

class MarkdownTest extends TestSuite { }

let markdown = new MarkdownTest('Test Markdown')

markdown.runTests(
    testCase('Bold conversion', () => {
        const md = '**STRONG!**'
        const html = convert(md)
        assert.equal(html, '<strong>STRONG!</strong>')
    }),
    testCase('Italic conversion', () => {
        const md = '_Italic_'
        const html = convert(md)
        assert.equal(html, '<em>Italic</em>')
    }),
    testCase('Link conversion', () => {
        const md = '[Link](https://example.com)'
        const html = convert(md)
        assert.equal(html, '<a href="https://example.com">Link</a>')
    }),
    testCase('Headers', () => {
        assert.equal(convert('# Title1'), '<h1>Title1</h1>')
        assert.equal(convert('## Title2'), '<h2>Title2</h2>')
        assert.equal(convert('### Title3'), '<h3>Title3</h3>')
    })
)

class RenderTest extends TestSuite {
    engine: TemplateEngine = new TemplateEngine()

    setup(): void {
        this.engine = new TemplateEngine()
    }
}

const templateTests = new RenderTest('Template engine')

templateTests.runTests(
    testCase('Simple lines should appear the same', (env) => {
        assert.equal(env.engine.render('Hello').trim(), 'Hello')
    }),
    testCase('Variable substitution', (env) => {
        assert.equal(env.engine.render('Hello ${name}', {name: 'Arash'}).trim(), 'Hello Arash')
    }),
    testCase('Multiple variable substitution', (env) => {
        assert.equal(env.engine.render('Hello ${name} with age ${ age }', {name: 'John', age: 100}), 'Hello John with age 100\n')
    }),
    testCase('If condition', (env) => {
        const template =
        `% if (num > 0) {
        num more than 0
        % } else {
        num less than 0
        % }`
        assert.equal(env.engine.render(template, {num: 1}).trim(), 'num more than 0')
        assert.equal(env.engine.render(template, {num: -1}).trim(), 'num less than 0')
    }),
    testCase('For loop', (env) => {
        const template =
        `% for (let i of nums)
        \${i}`
        assert.equal(env.engine.render(template, {nums: [1,2,3]}).replaceAll(/\s/g, ''), "123")
    }),
    testCase('For loop on objects', (env) => {
        const template =
        `% for (let p of people) {
        \${p.name}|
        \${p.age}-
        % }`
        const data = { people: [{name: 'A', age: 10}, {name: 'B', age: 20}] }
        assert.equal(env.engine.render(template, data).replaceAll(/\s/g, ''), 'A|10-B|20-')
    }),
    testCase('Include html into page', (env) => {
        env.engine.includes.set('intro.html', 'Hello')
        const template =
        `%- include intro.html
        <p> Content </p>`
        const rendered = env.engine.render(template)
        assert.ok(rendered.startsWith('Hello'))
    })
)
