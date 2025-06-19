import { EOL } from 'node:os';
import type { ParseOptions, ParseResult, ChangeObject, ParserStateType } from './types.js';
import { ParserState, ChangeTypes } from './types.js';

/**
 * Creates a new empty change object
 */
function createChangeObject(): ChangeObject {
  return {
    fixes: [],
    features: [],
    breakingChanges: [],
  };
}

/**
 * Parse conventional changelog content
 *
 * @param changelog - The changelog content to parse
 * @param options - Parser options
 * @returns Parsed changelog data
 */
export function parseChangelog(changelog: string, options: ParseOptions = {}): ParseResult {
  const mergedOptions: Required<ParseOptions> = {
    includeDetails: true,
    ...options,
  };

  const total = changelog.length;
  let cur = 0;
  let EOF = false;
  let state: ParserStateType = ParserState.NULL;
  let buf = '';

  const result: ParseResult = {
    versions: [],
    changes: {},
  };

  let curType: string | undefined;
  let curVersion: string | undefined;

  function peek(pos: number): string {
    return changelog[pos] || '';
  }

  const includeMarkdownVersionLink = /\[[\d.]+]\(http.+\)/.test(changelog);

  let peekBeforeVersion: () => void;
  if (includeMarkdownVersionLink) {
    // [{VERSION}](https://....)
    peekBeforeVersion = () => {
      if (peek(cur) === '[' && /\d/.test(peek(cur + 1))) {
        state = ParserState.VERSION;
      }
    };
  } else {
    // <a name={VERSION}></a>
    // Notes: conventional-changelog@2.0.0+ remove that a anchor
    // https://github.com/conventional-changelog/conventional-changelog/pull/301
    peekBeforeVersion = () => {
      if (peek(cur) === '<' && peek(cur + 1) !== '/') {
        cur += 1;
        state = ParserState.BEFVERSION;
      }
    };
  }

  let peekVersionChar: string;
  if (includeMarkdownVersionLink) {
    peekVersionChar = ']';
  } else {
    peekVersionChar = '"';
  }

  const peekVersion = () => {
    if (peek(cur) === peekVersionChar) {
      result.versions.push(buf);
      curVersion = buf;
      result.changes[curVersion] = createChangeObject();

      buf = '';
      state = ParserState.NULL;
    } else {
      buf += peek(cur);
    }
  };

  const states: Record<string, () => void> = {
    [ParserState.NULL]: function () {
      peekBeforeVersion();

      if (
        peek(cur) === '#' &&
        peek(cur + 1) === '#' &&
        peek(cur + 2) === '#' &&
        peek(cur + 3) === ' '
      ) {
        cur += 3;
        state = ParserState.TYPE;
      }

      if (peek(cur) === '*' && peek(cur + 1) === ' ') {
        cur += 1;
        state = ParserState.DES;
      }
    },
    [ParserState.BEFVERSION]: function () {
      if (peek(cur) === '"') {
        state = ParserState.VERSION;
      }
    },
    [ParserState.VERSION]: function () {
      peekVersion();
    },
    [ParserState.TYPE]: function () {
      if (peek(cur) === EOL || EOF) {
        if (buf === ChangeTypes.FIX) {
          curType = 'fixes';
        }

        if (buf === ChangeTypes.FEAT) {
          curType = 'features';
        }

        if (buf === ChangeTypes.BREAKING_CHANGES) {
          curType = 'breakingChanges';
        }

        buf = '';
        state = ParserState.NULL;
      } else {
        buf += peek(cur);
      }
    },
    [ParserState.DES]: (function (include) {
      function pushBuf() {
        if (curVersion && curType) {
          const changeObj = result.changes[curVersion];
          if (changeObj && curType in changeObj) {
            (changeObj[curType as keyof ChangeObject] as string[]).push(buf);
          }
        }
      }

      if (include) {
        return function () {
          if (peek(cur) === EOL || EOF) {
            pushBuf();
            buf = '';
            state = ParserState.NULL;
          } else {
            buf += peek(cur);
          }
        };
      } else {
        return function () {
          if (peek(cur) === ' ' && peek(cur + 1) === '(' && peek(cur + 2) === '[') {
            pushBuf();
            buf = '';
            cur += 2;
            state = ParserState.NULL;
          } else {
            buf += peek(cur);
          }
        };
      }
    })(mergedOptions.includeDetails),
  };

  while (cur <= total) {
    const stateHandler = states[state];
    if (stateHandler) {
      stateHandler();
    }
    cur++;
  }

  EOF = true;
  // EOF
  const finalStateHandler = states[state];
  if (finalStateHandler) {
    finalStateHandler();
  }

  return result;
}

/**
 * Default export for backward compatibility
 */
export default parseChangelog;
