import { BusFactorData, CorrectnessData, ResponsesivenessData } from '../models/middleware-inputs';
/**
 * Gets the data required to calculate the bus factor.
 *
 * @param repoUrl Github repository url.
 * @returns The data required to calculate the bus factor.
 */
export declare function getBusFactorData(repoUrl: string): Promise<BusFactorData>;
/**
 * Gets the data required to calculate the correctness.
 *
 * @param repoUrl Github repository url
 * @returns The data required to calculate the correctness.
 */
export declare function getCorrectnessData(repoUrl: string): Promise<CorrectnessData>;
/**
 * Determines if the repository is compliant with the lgpl-2.1 license.
 *
 * TODO: add other compatiable licenses
 *
 * @param repoUrl Github repository url
 * @returns 1 if the repository is compliant with the lgpl-2.1 license, 0 otherwise.
 */
export declare function getLiscenseComplianceData(repoUrl: string): Promise<number>;
/**
 * Gets the data required to calculate the responsiveness.
 *
 * @param repoUrl Github repository url
 * @returns The data required to calculate the responsiveness.
 */
export declare function getResponsivenessData(repoUrl: string): Promise<ResponsesivenessData>;
/**
 * Converts a NPM link into a Github repository url.
 *
 * @param npmUrl Link to npm package
 * @returns Github repository url
 */
export declare function getGithubLinkFromNpm(npmUrl: string): Promise<string>;
