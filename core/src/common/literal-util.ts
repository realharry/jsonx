import { CyclicCharArray } from './cyclic-char-array';
import { Literals } from './literals';

export namespace LiteralUtil {
  const NULL_CHARS = ['n', 'u', 'l', 'l'];
  const TRUE_CHARS = ['t', 'r', 'u', 'e'];
  const FALSE_CHARS = ['f', 'a', 'l', 's', 'e'];

  function getLength(c: CyclicCharArray | string[]): number {
    return Array.isArray(c) ? c.length : c.getLength();
  }

  function getCharAtIndex(c: CyclicCharArray | string[], index: number): string {
    return Array.isArray(c) ? c[index] : c.getChar(index);
  }

  export function isNull(c: CyclicCharArray | string[]): boolean {
    if (!c || getLength(c) !== Literals.NULL_LENGTH) {
      return false;
    }
    for (let i = 0; i < Literals.NULL_LENGTH; i++) {
      if (getCharAtIndex(c, i) !== NULL_CHARS[i]) {
        return false;
      }
    }
    return true;
  }

  export function isNullIgnoreCase(c: CyclicCharArray | string[]): boolean {
    if (!c || getLength(c) !== Literals.NULL_LENGTH) {
      return false;
    }
    const str = Array.isArray(c) ? c.join('') : c.toString();
    return str.toLowerCase() === Literals.NULL;
  }

  export function isTrue(c: CyclicCharArray | string[]): boolean {
    if (!c || getLength(c) !== Literals.TRUE_LENGTH) {
      return false;
    }
    for (let i = 0; i < Literals.TRUE_LENGTH; i++) {
      if (getCharAtIndex(c, i) !== TRUE_CHARS[i]) {
        return false;
      }
    }
    return true;
  }

  export function isTrueIgnoreCase(c: CyclicCharArray | string[]): boolean {
    if (!c || getLength(c) !== Literals.TRUE_LENGTH) {
      return false;
    }
    const str = Array.isArray(c) ? c.join('') : c.toString();
    return str.toLowerCase() === Literals.TRUE;
  }

  export function isFalse(c: CyclicCharArray | string[]): boolean {
    if (!c || getLength(c) !== Literals.FALSE_LENGTH) {
      return false;
    }
    for (let i = 0; i < Literals.FALSE_LENGTH; i++) {
      if (getCharAtIndex(c, i) !== FALSE_CHARS[i]) {
        return false;
      }
    }
    return true;
  }

  export function isFalseIgnoreCase(c: CyclicCharArray | string[]): boolean {
    if (!c || getLength(c) !== Literals.FALSE_LENGTH) {
      return false;
    }
    const str = Array.isArray(c) ? c.join('') : c.toString();
    return str.toLowerCase() === Literals.FALSE;
  }
}

