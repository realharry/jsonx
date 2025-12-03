import { JsonToken } from './token';

export interface JsonTokenizer {
  hasMore(): Promise<boolean>;
  next(): Promise<JsonToken>;
  peek(): Promise<JsonToken>;
}
