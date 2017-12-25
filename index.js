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

function changeObj () {
  return {
    fixes: [],
    features: [],
    breakingChanges: []
  }
}

function parseChangelog (changelog, options) {
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
  let curVerion

  function peek (pos) {
    return changelog[pos]
  }

  const states = {
    'NULL': function () {
      if (peek(cur) === '<' && peek(cur + 1) !== '/') {
        cur += 1
        state = STATES.BEFVERSION
      }

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
      if (peek(cur) === '"') {
        rst.versions.push(buf)
        curVerion = buf
        rst.changes[curVerion] = changeObj()

        buf = ''
        state = STATES.NULL
      } else {
        buf += peek(cur)
      }
    },
    'TYPE': function () {
      if (peek(cur) === EOL || EOF) {
        if (buf === TYPES.FIX) {
          curType = 'fixes'
        }

        if (buf === TYPES.FEAT) {
          curType = 'features'
        }

        if (buf === TYPES.BREAKING_CHANGES){
          curType = 'breakingChanges'
        }

        buf = ''
        state = STATES.NULL
      } else {
        buf += peek(cur)
      }
    },
    'DES': (function (include) {
      if (include) {
        return function () {
          if (peek(cur) === EOL || EOF) {
            if(curVerion && curType) {
                rst.changes[curVerion][curType].push(buf)
            }
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
            if(curVerion && curType) {
                rst.changes[curVerion][curType].push(buf)
            }
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
