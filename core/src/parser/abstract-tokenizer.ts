import {
  CharacterUtil
} from '../common/character-util';
import {
  CyclicCharArray
} from '../common/cyclic-char-array';
import {
  Literals
} from '../common/literals';
import {
  LiteralUtil
} from '../common/literal-util';
import {
  Symbols
} from '../common/symbols';
import {
  UnicodeUtil
} from '../common/unicode-util';
import {
  CharQueue
} from '../common/char-queue';
import { JsonToken, TokenType } from './token';
import { JsonTokenizer } from './tokenizer';
import { TokenizerOptions } from './options';
import { TokenPool } from './token-pool';

export abstract class AbstractJsonTokenizer implements JsonTokenizer {
  private static readonly MAX_STRING_LOOKAHEAD_SIZE = 256;
  private static readonly CHARQUEUE_SIZE = 4096;
  private static readonly READER_BUFF_SIZE = 1024;

  private reader: AsyncIterableIterator<string>;
  private readerEOF = false;
  private nextToken: JsonToken | null = null;
  private readonly charQueue: CharQueue;
  protected readonly options: TokenizerOptions;

  constructor(reader: AsyncIterableIterator<string>, options?: TokenizerOptions) {
    this.reader = reader;
    this.charQueue = new CharQueue(AbstractJsonTokenizer.CHARQUEUE_SIZE);
    this.options = options || {};
  }

  async hasMore(): Promise<boolean> {
    if (this.nextToken === null) {
      this.nextToken = await this.prepareNextToken();
    }
    return this.nextToken !== null && this.nextToken.type !== TokenType.EOF;
  }

  async next(): Promise<JsonToken> {
    if (this.nextToken === null) {
      this.nextToken = await this.prepareNextToken();
    }
    const token = this.nextToken;
    this.nextToken = null;
    if (token === null) {
      // Should not happen if hasMore() is checked
      return TokenPool.TOKEN_EOF;
    }
    return token;
  }

  async peek(): Promise<JsonToken> {
    if (this.nextToken !== null) {
      return this.nextToken;
    }
    this.nextToken = await this.prepareNextToken();
    if (this.nextToken === null) {
      // Should not happen
      return TokenPool.TOKEN_EOF;
    }
    return this.nextToken;
  }

  private async prepareNextToken(): Promise<JsonToken | null> {
    if (this.nextToken !== null) {
      return this.nextToken;
    }

    let ch = await this.gobbleUpSpace();
    if (ch === null) {
      return TokenPool.TOKEN_EOF;
    }


    // If custom literal mappings are provided, prefer identifier-style parsing
    // so users can map tokens like NaN/INF. Otherwise fall back to strict
    // JSON literal parsing (null/true/false).
    if (isIdentifierStart(ch) && this.options?.customLiterals) {
      return this.doIdentifierOrLiteral();
    }

    switch (ch) {
      case Symbols.COMMA:
      case Symbols.COLON:
      case Symbols.LSQUARE:
      case Symbols.LCURLY:
      case Symbols.RSQUARE:
      case Symbols.RCURLY:
        this.charQueue.skip();
        return TokenPool.getSymbolToken(ch);
      case Symbols.NULL_START:
      case Symbols.NULL_START_UPPER:
        if (this.options?.customLiterals) {
          return this.doIdentifierOrLiteral();
        }
        return this.doNullLiteral();
      case Symbols.TRUE_START:
      case Symbols.TRUE_START_UPPER:
        if (this.options?.customLiterals) {
          return this.doIdentifierOrLiteral();
        }
        return this.doTrueLiteral();
      case Symbols.FALSE_START:
      case Symbols.FALSE_START_UPPER:
        if (this.options?.customLiterals) {
          return this.doIdentifierOrLiteral();
        }
        return this.doFalseLiteral();
      case Symbols.DQUOTE:
        return this.doString();
      case "'":
        if (this.options?.allowSingleQuotedStrings) {
          return this.doSingleQuotedString();
        }
        break;
      default:
        if (Symbols.isStartingNumber(ch)) {
          return this.doNumber();
        }
        if (isIdentifierStart(ch)) {
          return this.doIdentifierOrLiteral();
        }
        throw new Error(`Invalid symbol encountered: ch = ${ch}`);
    }
    return null;
  }

  private async gobbleUpSpace(): Promise<string | null> {
    let c = await this.peekChar();
    while (
      c !== null &&
      (CharacterUtil.isWhitespace(c) || (this.options?.allowComments && c === Symbols.SLASH))
    ) {
      // whitespace
      if (CharacterUtil.isWhitespace(c)) {
        this.charQueue.skip();
        c = await this.peekChar();
        continue;
      }

      // comment handling when allowComments is true
      if (this.options?.allowComments && c === Symbols.SLASH) {
        // consume '/'
        this.charQueue.skip();
        const next = await this.peekChar();
        if (next === '/') {
          // single-line comment: skip until newline or CR or EOF
          this.charQueue.skip();
          let ch = await this.peekChar();
          while (ch !== null && ch !== Symbols.NEWLINE && ch !== Symbols.RETURN) {
            this.charQueue.skip();
            ch = await this.peekChar();
          }
          // skip newline or carriage return as well
          if (ch === Symbols.NEWLINE || ch === Symbols.RETURN) {
            this.charQueue.skip();
          }
          c = await this.peekChar();
          continue;
        } else if (next === '*') {
          // multi-line comment: skip until '*/' or EOF
          this.charQueue.skip(); // consume '*'
          let ch = await this.peekChar();
          let prev = '';
          while (ch !== null) {
            if (prev === '*' && ch === Symbols.SLASH) {
              // consume '/'
              this.charQueue.skip();
              break;
            }
            prev = ch;
            this.charQueue.skip();
            ch = await this.peekChar();
          }
          c = await this.peekChar();
          continue;
        } else {
          // Not a comment; leave it for tokenizer's symbol handling by returning it
          // We consumed the '/', so we need to treat it as an unexpected symbol
          throw new Error(`Unexpected '/' encountered while parsing`);
        }
      }
    }
    return c;
  }

  private async doNullLiteral(): Promise<JsonToken> {
    const c = await this.nextCharsInQueue(Literals.NULL_LENGTH);
    if (c === null) {
      throw new Error('Unexpected end of stream while reading null literal');
    }
    if (LiteralUtil.isNull(c)) {
      return TokenPool.TOKEN_NULL;
    } else {
      throw new Error(`Unexpected string: ${c.toString()}`);
    }
  }

  private async doTrueLiteral(): Promise<JsonToken> {
    const c = await this.nextCharsInQueue(Literals.TRUE_LENGTH);
    if (c === null) {
      throw new Error('Unexpected end of stream while reading true literal');
    }
    if (LiteralUtil.isTrue(c)) {
      return TokenPool.TOKEN_TRUE;
    } else {
      throw new Error(`Unexpected string: ${c.toString()}`);
    }
  }

  private async doFalseLiteral(): Promise<JsonToken> {
    const c = await this.nextCharsInQueue(Literals.FALSE_LENGTH);
    if (c === null) {
      throw new Error('Unexpected end of stream while reading false literal');
    }
    if (LiteralUtil.isFalse(c)) {
      return TokenPool.TOKEN_FALSE;
    } else {
      throw new Error(`Unexpected string: ${c.toString()}`);
    }
  }

  private async doString(): Promise<JsonToken> {
    const value = await this.readString();
    return TokenPool.getInstance().getToken(TokenType.STRING, value);
  }

  private async doSingleQuotedString(): Promise<JsonToken> {
    const value = await this.readSingleQuotedString();
    return TokenPool.getInstance().getToken(TokenType.STRING, value);
  }

  private async readSingleQuotedString(): Promise<string> {
    let c = this.charQueue.poll();
    if (c === null || c !== "'") {
      throw new Error(`Expecting single-quoted String. Invalid token encountered: c = ${c}`);
    }

    const sb: string[] = [];
    let escaped = false;
    let d = await this.peekChar();

    while (d !== null && (escaped || d !== "'")) {
      d = this.charQueue.poll();
      if (d === null) break;

      if (!escaped && d === Symbols.BACKSLASH) {
        escaped = true;
      } else {
        if (escaped) {
          if (d === Symbols.UNICODE_PREFIX) {
            const hex = await this.nextCharsInQueue(4);
            if (hex === null) {
              throw new Error('Unexpected end of stream while reading unicode escape');
            }
            const u = UnicodeUtil.getUnicodeChar(hex);
            sb.push(u);
          } else {
            switch (d) {
              case '\"':
                sb.push('"');
                break;
              case Symbols.BACKSLASH:
                sb.push('\\');
                break;
              case '/':
                sb.push('/');
                break;
              case 'b':
                sb.push('\b');
                break;
              case 'f':
                sb.push('\f');
                break;
              case 'n':
                sb.push('\n');
                break;
              case 'r':
                sb.push('\r');
                break;
              case 't':
                sb.push('\t');
                break;
              default: {
                const e = Symbols.getEscapedChar(d);
                if (e !== null) {
                  sb.push(e);
                } else {
                  throw new Error(`Invalid escaped char: d = ${d}`);
                }
              }
            }
          }
          escaped = false;
        } else {
          sb.push(d);
        }
      }
      d = await this.peekChar();
    }

    if ((await this.peekChar()) === "'") {
      this.charQueue.poll();
    }

    return sb.join('');
  }

  private async doIdentifierOrLiteral(): Promise<JsonToken> {
    // read identifier-like token
    const parts: string[] = [];
    let ch = this.charQueue.peek();
    while (ch !== null && isIdentifierPart(ch)) {
      parts.push(this.charQueue.poll()!);
      ch = this.charQueue.peek();
    }
    const value = parts.join('');

    // check custom literals mapping
    const custom = this.options?.customLiterals;
    if (custom && Object.prototype.hasOwnProperty.call(custom, value)) {
      const mapped = (custom as any)[value];
      if (mapped === null) {
        return TokenPool.TOKEN_NULL;
      }
      const t = typeof mapped;
      if (t === 'boolean') {
        return TokenPool.getInstance().getToken(TokenType.BOOLEAN, mapped);
      }
      if (t === 'number') {
        return TokenPool.getInstance().getToken(TokenType.NUMBER, mapped);
      }
      if (t === 'string') {
        return TokenPool.getInstance().getToken(TokenType.STRING, mapped);
      }
      // fallback: emit identifier with mapped value
      return TokenPool.getInstance().getToken(TokenType.IDENTIFIER, mapped);
    }

    // Not a known literal -> identifier
    return TokenPool.getInstance().getToken(TokenType.IDENTIFIER, value);
  }

  private async readString(): Promise<string> {
    let c = this.charQueue.poll();
    if (c === null || c !== Symbols.DQUOTE) {
      throw new Error(`Expecting String. Invalid token encountered: c = ${c}`);
    }
    const sb: string[] = [];
    let escaped = false;
    let d = await this.peekChar();
    while (d !== null && (escaped || d !== Symbols.DQUOTE)) {
      d = this.charQueue.poll();
      if (d === null) break;

      if (!escaped && d === Symbols.BACKSLASH) {
        escaped = true;
      } else {
        if (escaped) {
          if (d === Symbols.UNICODE_PREFIX) {
            const hex = await this.nextCharsInQueue(4);
            if (hex === null) {
              throw new Error('Unexpected end of stream while reading unicode escape');
            }
            const u = UnicodeUtil.getUnicodeChar(hex);
            sb.push(u);
          } else {
            switch (d) {
              case '"':
                sb.push('"');
                break;
              case Symbols.BACKSLASH:
                sb.push('\\');
                break;
              case '/':
                sb.push('/');
                break;
              case 'b':
                sb.push('\b');
                break;
              case 'f':
                sb.push('\f');
                break;
              case 'n':
                sb.push('\n');
                break;
              case 'r':
                sb.push('\r');
                break;
              case 't':
                sb.push('\t');
                break;
              default:
                throw new Error(`Invalid escaped char: d = ${d}`);
            }
          }
          escaped = false;
        } else {
          sb.push(d);
        }
      }
      d = await this.peekChar();
    }

    if ((await this.peekChar()) === Symbols.DQUOTE) {
      this.charQueue.poll();
    }
    return sb.join('');
  }

  private async readNumber(): Promise<number> {
    let c = this.charQueue.poll();
    if (c === null || !Symbols.isStartingNumber(c)) {
      throw new Error(`Expecting a number. Invalid symbol encountered: c = ${c}`);
    }
    if (c === Symbols.PLUS) {
      c = this.charQueue.poll();
    }
    if (c === null) {
      throw new Error('Unexpected end of stream while reading number');
    }
    const sb: string[] = [];
    if (c === Symbols.MINUS) {
      sb.push(c);
      c = this.charQueue.poll();
    }
    if (c === null) {
      throw new Error('Unexpected end of stream while reading number');
    }
    // include the first character (digit or period) we consumed
    if (c !== null) {
      if (c === Symbols.PERIOD) {
        sb.push(c);
        // mark that we've seen a period
      } else if (c >= '0' && c <= '9') {
        sb.push(c);
      }
    }
    let periodRead = false;
    let exponentRead = false;
    let d = await this.peekChar();
    while (d !== null &&
      ((d >= '0' && d <= '9') || (!periodRead && d === Symbols.PERIOD) || (!exponentRead && Symbols.isExponentChar(d)))) {
      sb.push(this.charQueue.poll()!);
      if (d === Symbols.PERIOD) {
        periodRead = true;
      }
      if (Symbols.isExponentChar(d)) {
        const d2 = await this.peekChar();
        if (d2 === Symbols.PLUS || d2 === Symbols.MINUS || (d2 !== null && d2 >= '0' && d2 <= '9')) {
          sb.push(this.charQueue.poll()!);
        } else {
          throw new Error(`Invalid number: ${sb.join('')}${d2}`);
        }
        exponentRead = true;
      }
      d = await this.peekChar();
    }
    const str = sb.join('');
    const num = parseFloat(str);
    if (isNaN(num)) {
      throw new Error(`Invalid number encountered: str = ${str}`);
    }
    return num;
  }

  private async doNumber(): Promise<JsonToken> {
    const value = await this.readNumber();
    return TokenPool.getInstance().getToken(TokenType.NUMBER, value);
  }

  private async peekChar(): Promise<string | null> {
    if (this.charQueue.isEmpty()) {
      await this.forward();
    }
    if (this.charQueue.isEmpty()) {
      return null;
    }
    return this.charQueue.peek();
  }

  private async nextCharsInQueue(length: number): Promise<import('../common/cyclic-char-array').CyclicCharArray | string[] | null> {
    if (this.charQueue.size() < length) {
      await this.forward();
    }
    if (this.charQueue.size() < length) {
      throw new Error(`There is not enough characters in the buffer. length = ${length}`);
    }
    const buf = this.charQueue.pollBuffer(length);
    if (buf === null) return null;
    return buf;
  }

  private async forward(): Promise<void> {
    if (this.readerEOF) {
      return;
    }
    const { value, done } = await this.reader.next();
    if (done) {
      this.readerEOF = true;
    } else {
      const suc = this.charQueue.addAll(value.split(''));
      if (!suc) {
        throw new Error('Unexpected internal error occurred. Characters were not added to CharQueue');
      }
    }
  }

}

function isIdentifierStart(ch: string): boolean {
  return (ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z') || ch === '_' || ch === '$';
}

function isIdentifierPart(ch: string): boolean {
  return isIdentifierStart(ch) || (ch >= '0' && ch <= '9') || ch === '-';
}

