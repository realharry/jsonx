import { CyclicCharArray } from './cyclic-char-array';

const MAX_BUFFER_SIZE = 10000000;
const DEF_BUFFER_SIZE = 2048;
const MIN_BUFFER_SIZE = 8;

export class CharQueue {
  private readonly buffer: string[];
  private readonly maxSize: number;
  private tailPointer = 0;
  private headPointer = 0;

  constructor(maxSize: number = DEF_BUFFER_SIZE) {
    if (maxSize < MIN_BUFFER_SIZE) {
      this.maxSize = MIN_BUFFER_SIZE;
    } else if (maxSize > MAX_BUFFER_SIZE) {
      this.maxSize = MAX_BUFFER_SIZE;
    } else {
      this.maxSize = maxSize;
    }
    this.buffer = new Array(this.maxSize);
  }

  private incrementHead(delta = 1): void {
    this.headPointer = (this.headPointer + delta) % this.maxSize;
  }

  private incrementTail(delta = 1): void {
    this.tailPointer = (this.tailPointer + delta) % this.maxSize;
  }

  margin(): number {
    if (this.tailPointer < this.headPointer) {
      return this.headPointer - this.tailPointer - 1;
    } else {
      return this.maxSize - (this.tailPointer - this.headPointer) - 1;
    }
  }

  maxCapacity(): number {
    return this.maxSize - 1;
  }

  size(): number {
    if (this.tailPointer < this.headPointer) {
      return this.maxSize + this.tailPointer - this.headPointer;
    } else {
      return this.tailPointer - this.headPointer;
    }
  }

  isEmpty(): boolean {
    return this.tailPointer === this.headPointer;
  }

  add(ch: string): boolean {
    if (this.margin() === 0) {
      return false;
    }
    this.buffer[this.tailPointer] = ch;
    this.incrementTail();
    return true;
  }

  addAll(c: string[] | string, length?: number): boolean {
    if (!c) {
      return false;
    }
    const arr = Array.isArray(c) ? c : [c];
    const len = length === undefined ? arr.length : Math.min(length, arr.length);

    if (this.margin() < len) {
      return false;
    }

    if (this.tailPointer + len < this.maxSize) {
      for (let i = 0; i < len; i++) {
        this.buffer[this.tailPointer + i] = arr[i];
      }
    } else {
      const first = this.maxSize - this.tailPointer;
      const second = len - first;
      for (let i = 0; i < first; i++) {
        this.buffer[this.tailPointer + i] = arr[i];
      }
      for (let i = 0; i < second; i++) {
        this.buffer[i] = arr[first + i];
      }
    }
    this.incrementTail(len);
    return true;
  }

  poll(): string | null {
    if (this.isEmpty()) {
      return null;
    }
    const ch = this.buffer[this.headPointer];
    this.incrementHead();
    return ch;
  }

  pollChars(length: number): string[] {
    if (this.isEmpty()) {
      return [];
    }
    if (length > this.size()) {
      length = this.size();
    }
    const polled: string[] = new Array(length);
    if (this.headPointer + length < this.maxSize) {
      for (let i = 0; i < length; i++) {
        polled[i] = this.buffer[this.headPointer + i];
      }
    } else {
      const first = this.maxSize - this.headPointer;
      const second = length - first;
      for (let i = 0; i < first; i++) {
        polled[i] = this.buffer[this.headPointer + i];
      }
      for (let i = 0; i < second; i++) {
        polled[first + i] = this.buffer[i];
      }
    }
    this.incrementHead(length);
    return polled;
  }

  pollBuffer(length: number): CyclicCharArray | null {
    if (this.isEmpty()) {
      return null;
    }
    if (length > this.size()) {
      length = this.size();
    }
    const charArray = CyclicCharArray.wrap(
      this.buffer,
      this.headPointer,
      length
    );
    this.incrementHead(length);
    return charArray;
  }

  skip(length = 1): void {
    if (!this.isEmpty()) {
      if (length > this.size()) {
        length = this.size();
      }
      this.incrementHead(length);
    }
  }

  peek(): string | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.buffer[this.headPointer];
  }

  peekChars(length: number): string[] {
    if (this.isEmpty()) {
      return [];
    }
    if (length > this.size()) {
      length = this.size();
    }
    const peeked: string[] = new Array(length);
    if (this.headPointer + length < this.maxSize) {
      for (let i = 0; i < length; i++) {
        peeked[i] = this.buffer[this.headPointer + i];
      }
    } else {
      const first = this.maxSize - this.headPointer;
      const second = length - first;
      for (let i = 0; i < first; i++) {
        peeked[i] = this.buffer[this.headPointer + i];
      }
      for (let i = 0; i < second; i++) {
        peeked[first + i] = this.buffer[i];
      }
    }
    return peeked;
  }

  peekBuffer(length: number, offset = 0): CyclicCharArray | null {
    if (this.isEmpty()) {
      return null;
    }
    if (offset < 0 || offset >= this.size()) {
        return null;
    }
    if (length > this.size() - offset) {
        length = this.size() - offset;
    }
    return CyclicCharArray.wrap(this.buffer, this.headPointer + offset, length);
  }

  toArray(): string[] {
    if (this.isEmpty()) {
      return [];
    }
    return this.peekChars(this.size());
  }

  clear(): void {
    this.headPointer = 0;
    this.tailPointer = 0;
  }

  toString(): string {
    return `CharQueue [buffer=${this.peekChars(100).join('')}, maxSize=${
      this.maxSize
    }, tailPointer=${this.tailPointer}, headPointer=${this.headPointer}]`;
  }
}
