/**
 * Get the commits made by the top contributor and the total contributions across
 * the top 10 contributors including the top contributor.
 *
 * @param repoUrl Github repository url
 * @returns Name of the most critical contributor, contributions by the critical
 *          contributor and the total contributions across the top 10 contributors
 *          If there is an error, returns ['', -1, -1].
 */
export declare function getCommitData(repoUrl: string): Promise<readonly [string, number, number]>;
/**
 * Get the number of pull requests made by the critical contributor and the total number of pull requests.
 * (might always return 100 pull requests because of github api pagination)
 *
 * @param repoUrl Github repository url
 * @param critUser The username of the critical contributor.
 * @returns The number of pull requests made by the critical contributor and the total number of pull requests.
 *          If there is an error, returns [-1, -1].
 */
export declare function getPullRequestData(repoUrl: string, critUser: string): Promise<readonly [number, number]>;
/**
 * Gets the number of issues in a given state.
 *
 * @param repoUrl Gihub repository url
 * @param state State of the issue
 * @returns The number of issues in the state.
 */
export declare function getIssues(repoUrl: string, state: 'open' | 'closed'): Promise<number>;
/**
 * Gets the license of the repository.
 *
 * @param repoUrl Github repository url
 * @returns The license of the repository.
 */
export declare function getLicense(repoUrl: string): Promise<string>;
/**
 * Gets the number of commits made in the past month.
 *
 * @param repoUrl  Github repository url
 * @returns The number of commits in the last 4 weeks
 */
export declare function getMonthlyCommitCount(repoUrl: string): Promise<Array<number>>;
/**
 * Gets the number of commits made in the past year.
 *
 * @param repoUrl Github repository url
 * @returns The number of commits in the last year.
 */
export declare function getAnualCommitCount(repoUrl: string): Promise<number>;
