import { Command } from '@oclif/core';
export declare function readFileAsync(packagePath: string): Promise<string>;
export declare class Install extends Command {
    run(): Promise<void>;
}
