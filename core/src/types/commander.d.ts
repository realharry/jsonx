declare module 'commander' {
  export class Command {
    constructor();
    name(n: string): this;
    description(d: string): this;
    requiredOption(flag: string, description?: string): this;
    option(flag: string, description?: string, defaultValue?: any): this;
    parse(argv: string[]): void;
    opts(): Record<string, any>;
    helpOption(flag: string, description?: string): this;
  }
  export { Command };
}
