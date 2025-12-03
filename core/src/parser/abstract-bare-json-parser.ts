import {
  JsonToken,
  TokenType
} from './token';
import {
  JsonParser
} from './json-parser';
import {
  SimpleJsonTokenizer
} from './simple-tokenizer';
import {
  JsonTokenizer
} from './tokenizer';

async function* stringReader(str: string) {
  yield str;
}

export abstract class AbstractBareJsonParser implements JsonParser {

  async parse(jsonStr: string, options?: import('./options').ParserOptions): Promise<any> {
    const reader = stringReader(jsonStr);
    const tokenizer = new SimpleJsonTokenizer(reader, {
      allowComments: options?.allowComments,
      allowSingleQuotedStrings: options?.allowSingleQuotedStrings,
      allowUnquotedKeys: options?.allowUnquotedKeys,
      customLiterals: options?.customLiterals
    });
    return this.parseWithTokenizer(tokenizer, options);
  }

  private async parseWithTokenizer(tokenizer: JsonTokenizer, options?: import('./options').ParserOptions): Promise<any> {
    const token = await tokenizer.peek();
    switch (token.type) {
      case TokenType.LCURLY:
        return this.produceJsonObject(tokenizer, options);
      case TokenType.LSQUARE:
        return this.produceJsonArray(tokenizer, options);
      case TokenType.STRING:
        await tokenizer.next();
        return token.value;
      case TokenType.NUMBER:
        await tokenizer.next();
        return token.value;
      case TokenType.BOOLEAN:
        await tokenizer.next();
        return token.value;
      case TokenType.NULL:
        await tokenizer.next();
        return null;
      default:
        throw new Error(`Invalid JSON input. Starts with token ${token}`);
    }
  }

  private async produceJsonObject(tokenizer: JsonTokenizer, options?: import('./options').ParserOptions): Promise<Record<string, any>> {
    await this.expect(tokenizer, TokenType.LCURLY);
    const obj: Record<string,
      any> = {};
    let first = true;
    while (true) {
      const nextPeek = await tokenizer.peek();
      if (nextPeek.type === TokenType.RCURLY) {
        await tokenizer.next(); // consume RCURLY
        break;
      }

      if (!first) {
        const sep = await tokenizer.next();
        if (sep.type !== TokenType.COMMA) {
          throw new Error(`Expected comma separator in object but got ${sep}`);
        }
        const afterSep = await tokenizer.peek();
        if (afterSep.type === TokenType.RCURLY && options?.allowTrailingComma) {
          await tokenizer.next(); // consume RCURLY
          break;
        }
      }

      first = false;

      const keyToken = await tokenizer.next();
      if (keyToken.type !== TokenType.STRING) {
        if (keyToken.type === TokenType.IDENTIFIER && options?.allowUnquotedKeys) {
          // accept identifier as unquoted key
        } else {
          throw new Error('Expected string key in object');
        }
      }
      await this.expect(tokenizer, TokenType.COLON);
      obj[String(keyToken.value)] = await this.parseWithTokenizer(tokenizer, options);
    }
    return obj;
  }

  private async produceJsonArray(tokenizer: JsonTokenizer, options?: import('./options').ParserOptions): Promise<any[]> {
    await this.expect(tokenizer, TokenType.LSQUARE);
    const arr: any[] = [];
    let first = true;
    while (true) {
      const nextPeek = await tokenizer.peek();
      if (nextPeek.type === TokenType.RSQUARE) {
        await tokenizer.next(); // consume RSQUARE
        break;
      }
      if (!first) {
        const sep = await tokenizer.next();
        if (sep.type !== TokenType.COMMA) {
          throw new Error(`Expected comma separator in array but got ${sep}`);
        }
        const afterSep = await tokenizer.peek();
        if (afterSep.type === TokenType.RSQUARE && options?.allowTrailingComma) {
          await tokenizer.next(); // consume RSQUARE
          break;
        }
      }
      first = false;
      arr.push(await this.parseWithTokenizer(tokenizer, options));
    }
    return arr;
  }

  private async expect(tokenizer: JsonTokenizer, type: TokenType): Promise<void> {
    const token = await tokenizer.next();
    if (token.type !== type) {
      throw new Error(`Expected token type ${type} but got ${token.type}`);
    }
  }
}