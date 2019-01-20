const EOL = require('os').EOL

const STATES = {
  NULL: 'NULL',
  BEFVERSION: 'BEFVERSION',
  VERSION: 'VERSION',
  TYPE: 'TYPE',
  DES: 'DES'
}

const TYPES = {
  FIX: 'Bug Fixes',
  FEAT: 'Features',
  BREAKING_CHANGES: 'BREAKING CHANGES'
}

function changeObj() {
  return {
    fixes: [],
    features: [],
    breakingChanges: []
  }
}

function parseChangelog(changelog, options) {
  const total = changelog.length
  let cur = 0
  let EOF = false
  let state = STATES.NULL
  let buf = ''
  let rst = {
    versions: [],
    changes: {}
  }

  let _options = Object.assign({
    includeDetails: true
  }, options)

  let curType
  let curVersion

  function peek(pos) {
    return changelog[pos]
  }

  const includeMarkdownVersionLink = /\[[\d.]+]\(http.+\)/.test(changelog)

  let peekBeforeVersion

  if (includeMarkdownVersionLink) {
    // [{VERSION}](https://....)
    peekBeforeVersion = () => {
      if (peek(cur) === '[' && /\d/.test(peek(cur + 1))) {
        state = STATES.VERSION
      }
    }
  } else {
    // <a name={VERSION}></a>
    // Notes: conventional-changelog@2.0.0+ remove that a anchor
    // https://github.com/conventional-changelog/conventional-changelog/pull/301
    peekBeforeVersion = () => {
      if (peek(cur) === '<' && peek(cur + 1) !== '/') {
        cur += 1
        state = STATES.BEFVERSION
      }
    }
  }


  let peekVersionChar
  if (includeMarkdownVersionLink) {
    peekVersionChar = ']'
  } else {
    peekVersionChar = '"'
  }

  const peekVersion = () => {
    if (peek(cur) === peekVersionChar) {
      rst.versions.push(buf)
      curVersion = buf
      rst.changes[curVersion] = changeObj()

      buf = ''
      state = STATES.NULL
    } else {
      buf += peek(cur)
    }
  }

  const states = {
    'NULL': function () {
      peekBeforeVersion()

      if (peek(cur) === '#' &&
        peek(cur + 1) === '#' &&
        peek(cur + 2) === '#' &&
        peek(cur + 3) === ' '
      ) {
        cur += 3
        state = STATES.TYPE
      }

      if (peek(cur) === '*' && peek(cur + 1) === ' ') {
        cur += 1
        state = STATES.DES
      }
    },
    'BEFVERSION': function () {
      if (peek(cur) === '"') {
        state = STATES.VERSION
      }
    },
    'VERSION': function () {
      peekVersion()
    },
    'TYPE': function () {
      if (peek(cur) === EOL || EOF) {
        if (buf === TYPES.FIX) {
          curType = 'fixes'
        }

        if (buf === TYPES.FEAT) {
          curType = 'features'
        }

        if (buf === TYPES.BREAKING_CHANGES) {
          curType = 'breakingChanges'
        }

        buf = ''
        state = STATES.NULL
      } else {
        buf += peek(cur)
      }
    },
    'DES': (function (include) {
      function pushBuf() {
        if (curVersion && curType) {
          rst.changes[curVersion][curType].push(buf)
        }
      }

      if (include) {
        return function () {
          if (peek(cur) === EOL || EOF) {
            pushBuf()
            buf = ''
            state = STATES.NULL
          } else {
            buf += peek(cur)
          }
        }
      } else {
        return function () {
          if (
            peek(cur) === ' ' &&
            peek(cur + 1) === '(' &&
            peek(cur + 2) === '['
          ) {
            pushBuf()
            buf = ''
            cur += 2
            state = STATES.NULL
          } else {
            buf += peek(cur)
          }
        }
      }
    })(_options.includeDetails)
  }

  while (cur <= total) {
    states[state]()
    cur++
  }

  EOF = true
  // EOF
  states[state]()

  return rst
}

module.exports = parseChangelog