export const enum TokenType {
  EOF = -1,
  NULL = 0,
  COMMA = 3,
  COLON = 4,
  LSQUARE = 5,
  RSQUARE = 6,
  LCURLY = 7,
  RCURLY = 8,
  BOOLEAN = 9,
  NUMBER = 10,
  STRING = 11,
  IDENTIFIER = 12,
}

export class JsonToken {
  constructor(public readonly type: TokenType, public readonly value: any) { }

  static getHashCode(type: TokenType, value: any): number {
    const prime = 7211;
    let result = 1;
    result = prime * result + type;
    result = prime * result + (value === null ? 0 : this.hashCode(value));
    return result;
  }

  private static hashCode(value: any): number {
    if (typeof value === 'string') {
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }
    if (typeof value === 'number') {
      // Simple hash for numbers
      return value;
    }
    if (typeof value === 'boolean') {
      return value ? 1 : 0;
    }
    if (value === null) {
      return 0;
    }
    // For other types, you might want a more robust solution
    return 0;
  }


  equals(obj: any): boolean {
    if (this === obj) {
      return true;
    }
    if (obj === null || !(obj instanceof JsonToken)) {
      return false;
    }
    const other = obj as JsonToken;
    if (this.type !== other.type) {
      return false;
    }
    if (this.value === null) {
      if (other.value !== null) {
        return false;
      }
    } else if (this.value !== other.value) {
      return false;
    }
    return true;
  }

  toString(): string {
    return `JsonToken [type=${this.type}, value=${this.value}]`;
  }

  // instance convenience method matching Java's hashCode usage
  hashCode(): number {
    return JsonToken.getHashCode(this.type, this.value);
  }
}
