import { ParserOptions } from './options';

export interface JsonParser {
  parse(jsonStr: string, options?: ParserOptions): Promise<any>;
}
