/* eslint-env mocha */
const fs = require('fs')
const path = require('path')
const parser = require('../')
const assert = require('assert')
function getFix (name) {
  return path.join(__dirname, `./fixtures/${name}`)
}

function readFix (name) {
  return fs.readFileSync(getFix(name), 'utf-8')
}

describe('cclog-parser', function () {
  const empty = readFix('empty.md')
  const simple = readFix('simple.md')
  const karma = readFix('karma.md')
  const conventionalcommits = readFix('conventionalcommits.md')
  // mixed <a name="{Version}"></a> and [{Version}]()
  const converntionalchangelog2 = readFix('converntional_changelog2.md')

  it('simple parse', function () {
    const rst = parser(simple)

    assert(rst.versions.length === 2)
    assert(rst.versions.includes('0.0.1'))
    assert(rst.versions.includes('0.1.0'))

    assert(Object.keys(rst.changes).includes('0.0.1'))
    assert(rst.changes['0.0.1'].fixes.length === 2)
    assert(rst.changes['0.0.1'].features.length === 2)

    assert(rst.changes['0.0.1'].fixes[0] === 'fixc ([17c2c43](https://abc/commit/abc))')
  })

  it('empty parse', function () {
    const rst = parser(empty)
    assert(rst.versions.length === 0)
    assert(Object.keys(rst.changes).length === 0)
  })

  it('large parse', function () {
    const rst = parser(karma)
    assert(rst.versions.length > 10)
    assert(Object.keys(rst.changes).length > 10)
    assert(Object.keys(rst.changes).length === rst.versions.length)
  })

  it('conventionalcommits parse', function () {
    const rst = parser(conventionalcommits)
    assert(rst.versions.length > 10)
    assert(Object.keys(rst.changes).length > 10)
    assert(Object.keys(rst.changes).length === rst.versions.length)
    // make sure breakingChanges has parsed correctly
    assert(Object.keys(rst.changes).some(v => { return rst.changes[v].breakingChanges.length > 0 }))
  })
  it('parse conventional-changelog@2.0.0+ format', function () {
    const rst = parser(converntionalchangelog2)
    assert.strictEqual(rst.changes['3.0.0'].fixes.length, 2)
    assert.strictEqual(rst.changes['3.0.0'].features.length, 0)
    assert.strictEqual(rst.changes['3.0.0'].breakingChanges.length, 1)
    assert.strictEqual(rst.changes['2.0.0'].fixes.length, 0)
    assert.strictEqual(rst.changes['2.0.0'].features.length, 0)
    assert.strictEqual(rst.changes['3.0.0'].breakingChanges.length, 1)
  })
})
