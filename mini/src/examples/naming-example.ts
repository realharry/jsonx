import { parseMini } from '../parser';
import { buildMini } from '../builder';
import { JsonMapper } from '@aimuse/jsonx-core/dist/j4json/mapper/JsonMapper';

export function convertJsonxNaming(input: string, opts?: { jsonCase?: 'snake' | 'camel' | 'pascal', objectCase?: 'camel' | 'pascal' | 'identity' }) {
    // parse using mini parser (no file IO here)
    const parsed = parseMini(input, { allowComments: true, allowSingleQuotedStrings: true, allowUnquotedKeys: true, allowTrailingComma: true });

    // convert naming: assume parsed JSON uses snake_case and we want camelCase objects
    const mapped = JsonMapper.fromJson(parsed, undefined, { naming: { jsonCase: opts?.jsonCase ?? 'snake', objectCase: opts?.objectCase ?? 'camel' } });

    // do some processing (identity) and then serialize using JSON naming
    const serialized = JsonMapper.toString(mapped, { naming: { objectCase: opts?.objectCase ?? 'camel', jsonCase: opts?.jsonCase ?? 'snake' } });

    return serialized;
}
