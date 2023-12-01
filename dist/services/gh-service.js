"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGithubLinkFromNpm = exports.getResponsivenessData = exports.getLiscenseComplianceData = exports.getCorrectnessData = exports.getBusFactorData = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const ghApi = tslib_1.__importStar(require("./gh-api"));
const logger_1 = tslib_1.__importDefault(require("../logger"));
/**
 * Gets the data required to calculate the bus factor.
 *
 * @param repoUrl Github repository url.
 * @returns The data required to calculate the bus factor.
 */
async function getBusFactorData(repoUrl) {
    logger_1.default.info('GH_SERVICE: running getBusFactorData');
    const [criticalUserLogin, criticalContrubitorCommits, totalCommits] = await ghApi.getCommitData(repoUrl);
    const [criticalContributorPullRequests, totalPullRequests] = await ghApi.getPullRequestData(repoUrl, criticalUserLogin);
    return {
        criticalContrubitorCommits,
        totalCommits,
        criticalContributorPullRequests,
        totalPullRequests,
    };
}
exports.getBusFactorData = getBusFactorData;
/**
 * Gets the data required to calculate the correctness.
 *
 * @param repoUrl Github repository url
 * @returns The data required to calculate the correctness.
 */
async function getCorrectnessData(repoUrl) {
    logger_1.default.info('GH_SERVICE: running getCorrectnessData');
    const closedIssues = await ghApi.getIssues(repoUrl, 'closed');
    const openIssues = await ghApi.getIssues(repoUrl, 'open');
    return {
        closedIssues,
        openIssues,
    };
}
exports.getCorrectnessData = getCorrectnessData;
/**
 * Determines if the repository is compliant with the lgpl-2.1 license.
 *
 * TODO: add other compatiable licenses
 *
 * @param repoUrl Github repository url
 * @returns 1 if the repository is compliant with the lgpl-2.1 license, 0 otherwise.
 */
async function getLiscenseComplianceData(repoUrl) {
    logger_1.default.info('GH_SERVICE: running getLiscenseComplianceData');
    const liscense = await ghApi.getLicense(repoUrl);
    return liscense === 'lpgl-2.1' ? 1 : 0;
}
exports.getLiscenseComplianceData = getLiscenseComplianceData;
/**
 * Gets the data required to calculate the responsiveness.
 *
 * @param repoUrl Github repository url
 * @returns The data required to calculate the responsiveness.
 */
async function getResponsivenessData(repoUrl) {
    logger_1.default.info('GH_SERVICE: running getResponsivenessData');
    const monthlyCommitCount = await ghApi.getMonthlyCommitCount(repoUrl);
    const annualCommitCount = await ghApi.getAnualCommitCount(repoUrl);
    return {
        monthlyCommitCount,
        annualCommitCount,
    };
}
exports.getResponsivenessData = getResponsivenessData;
/**
 * Converts a NPM link into a Github repository url.
 *
 * @param npmUrl Link to npm package
 * @returns Github repository url
 */
async function getGithubLinkFromNpm(npmUrl) {
    logger_1.default.info('GH_SERVICE: running getGithubLinkFromNpm');
    const instance = axios_1.default.create({
        baseURL: 'https://registry.npmjs.org/',
        timeout: 10000,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
    }); // create axios instance
    const npmName = npmUrl.split('/')[4];
    try {
        const response = await instance.get(`${npmName}`);
        return response.data.repository.url;
    }
    catch {
        return 'error';
    }
}
exports.getGithubLinkFromNpm = getGithubLinkFromNpm;
