export interface TokenizerOptions {
    allowComments?: boolean;
    allowSingleQuotedStrings?: boolean;
    allowUnquotedKeys?: boolean;
    customLiterals?: Record<string, any> | null;
}

export interface ParserOptions {
    allowComments?: boolean;
    allowTrailingComma?: boolean;
    allowSingleQuotedStrings?: boolean;
    allowUnquotedKeys?: boolean;
    customLiterals?: Record<string, any> | null;
}
