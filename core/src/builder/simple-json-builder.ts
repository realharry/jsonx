import {
  JsonBuilder
} from './json-builder';
import {
  Symbols
} from '../common/symbols';
import {
  Literals
} from '../common/literals';
import {
  CharacterUtil
} from '../common/character-util';
import {
  UnicodeUtil
} from '../common/unicode-util';

export class SimpleJsonBuilder implements JsonBuilder {
  build(obj: any, indent: number = 0): string {
    const writer: string[] = [];
    const includeWS = indent > 0;
    const includeLB = indent > 0;
    const lbAfterComma = indent > 0; // This should be true when indent > 0
    this._build(writer, obj, includeWS, includeLB, lbAfterComma, indent, -1);
    return writer.join('');
  }

  private _build(
    writer: string[],
    obj: any,
    includeWS: boolean,
    includeLB: boolean,
    lbAfterComma: boolean,
    indentSize: number,
    indentLevel: number
  ): void {
    indentLevel++;
    const WS = includeWS ? ' ' : '';
    const LB = includeLB ? '\n' : '';
    const IND =
      indentSize > 0 && indentLevel > 0 ?
      ' '.repeat(indentSize * indentLevel) :
      '';
    const INDX =
      indentSize > 0 && indentLevel >= 0 ?
      ' '.repeat(indentSize * (indentLevel + 1)) :
      '';

    if (obj === null || obj === undefined) {
      writer.push(Literals.NULL);
    } else if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        writer.push('[', LB);
        if (obj.length > 0) {
          writer.push(INDX);
          for (let i = 0; i < obj.length; i++) {
            this._build(
              writer,
              obj[i],
              includeWS,
              includeLB,
              lbAfterComma,
              indentSize,
              indentLevel
            );
            if (i < obj.length - 1) {
              writer.push(',');
              if (lbAfterComma) {
                writer.push(LB, INDX);
              } else {
                writer.push(WS);
              }
            } else {
              writer.push(LB);
            }
          }
        }
        writer.push(IND, ']');
      } else {
        writer.push('{', LB);
        const keys = Object.keys(obj);
        if (keys.length > 0) {
          writer.push(INDX);
          for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            writer.push(`"${key}"`, ':', WS);
            this._build(
              writer,
              obj[key],
              includeWS,
              includeLB,
              lbAfterComma,
              indentSize,
              indentLevel
            );
            if (i < keys.length - 1) {
              writer.push(',');
              if (lbAfterComma) {
                writer.push(LB, INDX);
              } else {
                writer.push(WS);
              }
            } else {
              writer.push(LB);
            }
          }
        }
        writer.push(IND, '}');
      }
    } else if (typeof obj === 'string') {
      writer.push('"');
      this._appendEscapedString(writer, obj);
      writer.push('"');
    } else if (typeof obj === 'number') {
      writer.push(obj.toString());
    } else if (typeof obj === 'boolean') {
      writer.push(obj ? Literals.TRUE : Literals.FALSE);
    } else {
      writer.push('"');
      this._appendEscapedString(writer, obj.toString());
      writer.push('"');
    }
  }

  private _appendEscapedString(writer: string[], str: string): void {
    if (str) {
      for (const ec of str) {
        if (Symbols.isEscapableChar(ec)) {
          const s = Symbols.getEscapedChar(ec);
          if (s) {
            writer.push(s);
          } else {
            writer.push(ec);
          }
        } else if (CharacterUtil.isISOControl(ec)) {
          writer.push(...UnicodeUtil.getUnicodeHexCodeFromChar(ec));
        } else {
          writer.push(ec);
        }
      }
    }
  }
}