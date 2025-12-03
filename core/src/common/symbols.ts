export namespace Symbols {
  export const COMMA = ',';
  export const COLON = ':';
  export const LSQUARE = '[';
  export const RSQUARE = ']';
  export const LCURLY = '{';
  export const RCURLY = '}';
  export const DQUOTE = '"';
  export const BACKSLASH = '\\';
  export const SLASH = '/';
  export const BACKSPACE = '\b';
  export const FORMFEED = '\f';
  export const NEWLINE = '\n';
  export const RETURN = '\r';
  export const TAB = '\t';
  export const PLUS = '+';
  export const MINUS = '-';
  export const PERIOD = '.';
  export const EXP_LOWER = 'e';
  export const EXP_UPPER = 'E';
  export const ESCAPED_DQUOTE = '\"';
  export const ESCAPED_BACKSLASH = '\\';
  export const ESCAPED_BACKSPACE = '\b';
  export const ESCAPED_FORMFEED = '\f';
  export const ESCAPED_NEWLINE = '\n';
  export const ESCAPED_RETURN = '\r';
  export const ESCAPED_TAB = '\t';
  export const NULL_START = 'n';
  export const TRUE_START = 't';
  export const FALSE_START = 'f';
  export const NULL_START_UPPER = 'N';
  export const TRUE_START_UPPER = 'T';
  export const FALSE_START_UPPER = 'F';
  export const UNICODE_PREFIX = 'u';

  export function isEscapableChar(ch: string): boolean {
    switch (ch) {
      case DQUOTE:
      case BACKSLASH:
      case SLASH:
      case BACKSPACE:
      case FORMFEED:
      case NEWLINE:
      case RETURN:
      case TAB:
      case UNICODE_PREFIX:
        return true;
    }
    return false;
  }

  export function getEscapedChar(ch: string): string | null {
    switch (ch) {
      case DQUOTE:
        return '\\"';
      case BACKSLASH:
        return '\\\\';
      case SLASH:
        return '\\/'; // Always escape slash for now
      case BACKSPACE:
        return '\\b';
      case FORMFEED:
        return '\\f';
      case NEWLINE:
        return '\\n';
      case RETURN:
        return '\\r';
      case TAB:
        return '\\t';
    }
    return null;
  }

  export function isStartingNumber(ch: string): boolean {
    if (
      ch === MINUS ||
      ch === PLUS ||
      ch === PERIOD ||
      (ch >= '0' && ch <= '9')
    ) {
      return true;
    } else {
      return false;
    }
  }

  export function isExponentChar(ch: string): boolean {
    switch (ch) {
      case EXP_LOWER:
      case EXP_UPPER:
        return true;
      default:
        return false;
    }
  }
}
