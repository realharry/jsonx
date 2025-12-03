export class CyclicCharArray {
  private readonly arrayLength: number;
  private readonly backingArray: string[];
  private maxLength: number;
  private offset: number;
  private length: number;
  private end: number;

  constructor(backingArray: string[]) {
    this.backingArray = backingArray;
    this.arrayLength = this.backingArray.length;
    this.maxLength = 2 * this.arrayLength;
    this.offset = 0;
    this.length = 0;
    this.end = 0;
    this.resetEnd();
  }

  private resetEnd(): void {
    this.end = this.offset + this.length;
  }

  static wrap(
    backingArray: string[],
    offset?: number,
    length?: number
  ): CyclicCharArray {
    const charArray = new CyclicCharArray(backingArray);
    if (offset !== undefined && length !== undefined) {
      charArray.setOffsetAndLength(offset, length);
    }
    return charArray;
  }

  getOffset(): number {
    return this.offset;
  }

  setOffset(offset: number): void {
    this.offset = offset;
    this.resetEnd();
  }

  getLength(): number {
    return this.length;
  }

  setLength(length: number): void {
    this.length = length;
    this.resetEnd();
  }

  setOffsetAndLength(offset: number, length: number): void {
    this.offset = offset;
    this.length = length;
    this.resetEnd();
  }

  getChar(index: number): string {
    return this.backingArray[(this.offset + index) % this.arrayLength];
  }

  getChars(index: number, length: number): string[] {
    const copied: string[] = new Array(length);
    for (let i = 0; i < length; i++) {
      copied[i] =
        this.backingArray[(this.offset + index + i) % this.arrayLength];
    }
    return copied;
  }

  getArray(): string[] {
    const copied: string[] = new Array(this.length);
    for (let i = 0; i < this.length; i++) {
      copied[i] = this.backingArray[(this.offset + i) % this.arrayLength];
    }
    return copied;
  }

  toString(): string {
    return this.getArray().join('');
  }
}
