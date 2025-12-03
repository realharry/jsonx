import {
  AbstractJsonTokenizer
} from './abstract-tokenizer';

export class SimpleJsonTokenizer extends AbstractJsonTokenizer {
  constructor(reader: AsyncIterableIterator<string>, options?: import('./options').TokenizerOptions) {
    super(reader, options);
  }
}