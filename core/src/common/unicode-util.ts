import { CyclicCharArray } from './cyclic-char-array';

export namespace UnicodeUtil {
  export function isUnicodeHex(ch: string): boolean {
    return (
      (ch >= 'A' && ch <= 'F') ||
      (ch >= 'a' && ch <= 'f') ||
      (ch >= '0' && ch <= '9')
    );
  }

  export function getIntEquivalent(ch: string): number {
    if (ch >= '0' && ch <= '9') {
      return ch.charCodeAt(0) - 48;
    } else if (ch >= 'A' && ch <= 'F') {
      return ch.charCodeAt(0) - 55;
    } else if (ch >= 'a' && ch <= 'f') {
      return ch.charCodeAt(0) - 87;
    }
    return 0;
  }

  export function getUnicodeChar(hex: CyclicCharArray | string[]): string {
    if (!hex || (Array.isArray(hex) ? hex.length : hex.getLength()) !== 4) {
      return '';
    }
    return getUnicodeCharNoCheck(hex);
  }

  export function getUnicodeCharNoCheck(hex: CyclicCharArray | string[]): string {
    const str = Array.isArray(hex) ? hex.join('') : hex.getArray().join('');
    const code = parseInt(str, 16);
    return String.fromCharCode(code);
  }

  const HEXNUM = '0123456789abcdef'.split('');

  export function getUnicodeHexCodeFromChar(ch: string): string[] {
    const c6 = ['\\', 'u', '0', '0', '0', '0'];
    const code = ch.charCodeAt(0);
    c6[2] = HEXNUM[(code & 0xf000) >> 12];
    c6[3] = HEXNUM[(code & 0x0f00) >> 8];
    c6[4] = HEXNUM[(code & 0x00f0) >> 4];
    c6[5] = HEXNUM[code & 0x000f];
    return c6;
  }
}
