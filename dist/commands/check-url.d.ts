import { Command } from '@oclif/core';
export default class CheckUrl extends Command {
    static description: string;
    static args: {
        urls: import("@oclif/core/lib/interfaces/parser").Arg<string, Record<string, unknown>>;
    };
    run(): Promise<void>;
}
