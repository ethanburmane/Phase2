import { Command } from '@oclif/core';
export default class Test extends Command {
    static description: string;
    run(): Promise<void>;
}
