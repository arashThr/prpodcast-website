import assert from 'assert';
import { markdown_convert as convert } from './markdown.js'
import { render } from './templates.js'

function testCase(desc: string, testFunc: () => void) {
    return { desc, testFunc }
}

let counter = 1
function test(desc: string, ...tests: {desc: string, testFunc: () => void}[]) {
    console.log(`--- ${desc} ---`)
    for (let t of tests) {
        try {
            t.testFunc()
            console.log(`\u001b[32m✔ Test No. ${counter}: ${t.desc}\u001b[0m`)
        } catch (e) {
            console.log(`\u001b[31m✗ Test No. ${counter}: ${t.desc}\u001b[0m - Error:\n`, e)
        } finally {
            counter += 1
        }
    }
}

test(
    'Test Markdown',
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
    })
)

test(
    'Template engine',
    testCase('Simple lines should appear the same', () => {
        assert.equal(render('Hello').trim(), 'Hello')
    }),
    testCase('Variable substitution', () => {
        assert.equal(render('Hello ${name}', {name: 'Arash'}).trim(), 'Hello Arash')
    }),
    testCase('Multiple variable substitution', () => {
        assert.equal(render('Hello ${name} with age ${ age }', {name: 'John', age: 100}), 'Hello John with age 100\n')
    }),
    testCase('If condition', () => {
        const template =
        `% if (num > 0) {
        num more than 0
        % } else {
        num less than 0
        % }`
        assert.equal(render(template, {num: 1}).trim(), 'num more than 0')
        assert.equal(render(template, {num: -1}).trim(), 'num less than 0')
    }),
    testCase('For loop', () => {
        const template =
        `% for (let i of nums)
        \${i}`
        assert.equal(render(template, {nums: [1,2,3]}).replaceAll(/\s/g, ''), "123")
    }),
    testCase('For loop on objects', () => {
        const template =
        `% for (let p of people) {
        \${p.name}|
        \${p.age}-
        % }`
        const data = { people: [{name: 'A', age: 10}, {name: 'B', age: 20}] }
        assert.equal(render(template, data).replaceAll(/\s/g, ''), 'A|10-B|20-')
    })
)
