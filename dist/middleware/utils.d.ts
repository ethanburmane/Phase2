export declare function round(value: number, decimals: number): number;
export declare function identifyLink(link: string): "npm" | "github" | null;
export declare function getLinesOfCode(filePath: string): Promise<number>;
export declare function parseGHRepoName(repoUrl: string): string | null;
export declare function cloneRepo(ghUrl: string, localPath: string, repoUrl: string): Promise<void>;
export declare function calcRepoLines(repoPath: string, callback: (totalLines: number) => void): () => number;
export declare function evaluateLink(link: string): Promise<string | null>;
