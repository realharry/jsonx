export namespace CharacterUtil {
  export function isWhitespace(ch: string): boolean {
    switch (ch) {
      case ' ':
      case '\t':
      case '\n':
      case '\r':
        return true;
    }
    return false;
  }

  export function isISOControl(ch: string): boolean {
    const code = ch.charCodeAt(0);
    if ((code >= 0x0 && code <= 0x1f) || (code >= 0x7f && code <= 0x9f)) {
      return true;
    } else {
      return false;
    }
  }
}