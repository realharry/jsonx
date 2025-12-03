import { JsonToken, TokenType } from './token';
import { Literals } from '../common/literals';
import { Symbols } from '../common/symbols';

export class TokenPool {
    public static readonly TOKEN_EOF = new JsonToken(TokenType.EOF, null);
    public static readonly TOKEN_NULL = new JsonToken(TokenType.NULL, null);
    public static readonly TOKEN_COMMA = new JsonToken(TokenType.COMMA, Symbols.COMMA);
    public static readonly TOKEN_COLON = new JsonToken(TokenType.COLON, Symbols.COLON);
    public static readonly TOKEN_LSQUARE = new JsonToken(TokenType.LSQUARE, Symbols.LSQUARE);
    public static readonly TOKEN_RSQUARE = new JsonToken(TokenType.RSQUARE, Symbols.RSQUARE);
    public static readonly TOKEN_LCURLY = new JsonToken(TokenType.LCURLY, Symbols.LCURLY);
    public static readonly TOKEN_RCURLY = new JsonToken(TokenType.RCURLY, Symbols.RCURLY);
    public static readonly TOKEN_TRUE = new JsonToken(TokenType.BOOLEAN, true);
    public static readonly TOKEN_FALSE = new JsonToken(TokenType.BOOLEAN, false);

    private readonly tokenPool: Map<number, JsonToken>;

    private constructor() {
        this.tokenPool = new Map<number, JsonToken>();
        this.tokenPool.set(TokenPool.TOKEN_EOF.hashCode(), TokenPool.TOKEN_EOF);
        this.tokenPool.set(TokenPool.TOKEN_NULL.hashCode(), TokenPool.TOKEN_NULL);
        this.tokenPool.set(TokenPool.TOKEN_COMMA.hashCode(), TokenPool.TOKEN_COMMA);
        this.tokenPool.set(TokenPool.TOKEN_COLON.hashCode(), TokenPool.TOKEN_COLON);
        this.tokenPool.set(TokenPool.TOKEN_LSQUARE.hashCode(), TokenPool.TOKEN_LSQUARE);
        this.tokenPool.set(TokenPool.TOKEN_RSQUARE.hashCode(), TokenPool.TOKEN_RSQUARE);
        this.tokenPool.set(TokenPool.TOKEN_LCURLY.hashCode(), TokenPool.TOKEN_LCURLY);
        this.tokenPool.set(TokenPool.TOKEN_RCURLY.hashCode(), TokenPool.TOKEN_RCURLY);
        this.tokenPool.set(TokenPool.TOKEN_TRUE.hashCode(), TokenPool.TOKEN_TRUE);
        this.tokenPool.set(TokenPool.TOKEN_FALSE.hashCode(), TokenPool.TOKEN_FALSE);
    }

    private static _instance: TokenPool | null = null;
    public static getInstance(): TokenPool {
        if (!TokenPool._instance) {
            TokenPool._instance = new TokenPool();
        }
        return TokenPool._instance;
    }

    public static getSymbolToken(symbol: string): JsonToken | null {
        switch (symbol) {
            case Symbols.COMMA:
                return TokenPool.TOKEN_COMMA;
            case Symbols.COLON:
                return TokenPool.TOKEN_COLON;
            case Symbols.LSQUARE:
                return TokenPool.TOKEN_LSQUARE;
            case Symbols.RSQUARE:
                return TokenPool.TOKEN_RSQUARE;
            case Symbols.LCURLY:
                return TokenPool.TOKEN_LCURLY;
            case Symbols.RCURLY:
                return TokenPool.TOKEN_RCURLY;
            default:
                return null;
        }
    }

    public static getStockToken(type: TokenType, value: any): JsonToken | null {
        switch (type) {
            case TokenType.EOF:
                return TokenPool.TOKEN_EOF;
            case TokenType.NULL:
                return TokenPool.TOKEN_NULL;
            case TokenType.COMMA:
                return TokenPool.TOKEN_COMMA;
            case TokenType.COLON:
                return TokenPool.TOKEN_COLON;
            case TokenType.LSQUARE:
                return TokenPool.TOKEN_LSQUARE;
            case TokenType.RSQUARE:
                return TokenPool.TOKEN_RSQUARE;
            case TokenType.LCURLY:
                return TokenPool.TOKEN_LCURLY;
            case TokenType.RCURLY:
                return TokenPool.TOKEN_RCURLY;
            default:
                break;
        }
        if (type === TokenType.BOOLEAN) {
            return TokenPool.getBooleanToken(value);
        }
        return null;
    }

    private static getBooleanToken(value: any): JsonToken {
        if (value === true || value === Literals.TRUE) {
            return TokenPool.TOKEN_TRUE;
        }
        return TokenPool.TOKEN_FALSE;
    }

    public getToken(type: TokenType, value: any): JsonToken {
        const stock = TokenPool.getStockToken(type, value);
        if (stock) return stock;

        // Validate type roughly by checking allowed enum values
        // For unknown types, return TOKEN_NULL as a fallback
        if (type === undefined || type === null) {
            return TokenPool.TOKEN_NULL;
        }

        const h = JsonToken.getHashCode(type, value);
        if (this.tokenPool.has(h)) {
            return this.tokenPool.get(h)!;
        }
        const tok = new JsonToken(type, value);
        this.tokenPool.set(tok.hashCode(), tok);
        return tok;
    }
}
