/**
 * Parser options interface
 */
export interface ParseOptions {
  /**
   * Whether to include detailed commit information
   * @default true
   */
  includeDetails?: boolean;
}

/**
 * Change object containing categorized changes
 */
export interface ChangeObject {
  /** Bug fixes */
  fixes: string[];
  /** New features */
  features: string[];
  /** Breaking changes */
  breakingChanges: string[];
}

/**
 * Parse result interface
 */
export interface ParseResult {
  /** Array of version strings */
  versions: string[];
  /** Changes grouped by version */
  changes: Record<string, ChangeObject>;
}

/**
 * Parser states
 */
export const ParserState = {
  NULL: 'NULL',
  BEFVERSION: 'BEFVERSION',
  VERSION: 'VERSION',
  TYPE: 'TYPE',
  DES: 'DES',
} as const;

export type ParserStateType = (typeof ParserState)[keyof typeof ParserState];

/**
 * Change types mapping
 */
export const ChangeTypes = {
  FIX: 'Bug Fixes',
  FEAT: 'Features',
  BREAKING_CHANGES: 'BREAKING CHANGES',
} as const;
