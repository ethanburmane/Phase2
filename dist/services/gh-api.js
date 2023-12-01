"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnualCommitCount = exports.getMonthlyCommitCount = exports.getLicense = exports.getIssues = exports.getPullRequestData = exports.getCommitData = void 0;
const tslib_1 = require("tslib");
const dotenv = tslib_1.__importStar(require("dotenv"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const logger_1 = tslib_1.__importDefault(require("../logger"));
dotenv.config(); // load enviroment variables
/**
 * Get the commits made by the top contributor and the total contributions across
 * the top 10 contributors including the top contributor.
 *
 * @param repoUrl Github repository url
 * @returns Name of the most critical contributor, contributions by the critical
 *          contributor and the total contributions across the top 10 contributors
 *          If there is an error, returns ['', -1, -1].
 */
async function getCommitData(repoUrl) {
    logger_1.default.info('GH_API: running getCommitData');
    const instance = axios_1.default.create({
        baseURL: 'https://api.github.com/repos/',
        timeout: 10000,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
    }); // create axios instance
    const repoOwner = repoUrl.split('/')[3];
    const repoName = repoUrl.split('/')[4];
    try {
        const response = await instance.get(`${repoOwner}/${repoName}/contributors`);
        const { login } = response.data[0];
        const { contributions } = response.data[0];
        // get the total contribution acorss top 10 contributors
        let totalContributions = 0;
        for (let i = 0; i < response.data.length; i += 1) {
            totalContributions += response.data[i].contributions;
        }
        logger_1.default.debug('GH_API: getCommitData {', login, contributions, totalContributions, '}');
        return [login, contributions, totalContributions];
    }
    catch {
        logger_1.default.info('GH_API: getCommitData failed');
        return ['', -1, -1];
    }
}
exports.getCommitData = getCommitData;
/**
 * Get the number of pull requests made by the critical contributor and the total number of pull requests.
 * (might always return 100 pull requests because of github api pagination)
 *
 * @param repoUrl Github repository url
 * @param critUser The username of the critical contributor.
 * @returns The number of pull requests made by the critical contributor and the total number of pull requests.
 *          If there is an error, returns [-1, -1].
 */
async function getPullRequestData(repoUrl, critUser) {
    logger_1.default.info('GH_API: running getPullRequestData');
    const instance = axios_1.default.create({
        baseURL: 'https://api.github.com/repos/',
        timeout: 10000,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
    }); // create axios instance
    const repoOwner = repoUrl.split('/')[3];
    const repoName = repoUrl.split('/')[4];
    try {
        const response = await instance.get(`${repoOwner}/${repoName}/search/pulls`, {
            params: { state: 'all', per_page: 100 }, // eslint-disable-line camelcase
        });
        let crituserpullrequests = 0;
        const totalpullrequests = response.data.length;
        for (let i = 0; i < totalpullrequests; i += 1) {
            if (response.data[i].user.login === critUser) {
                crituserpullrequests += 1;
            }
        }
        logger_1.default.debug('GH_API: getPullRequestData {', crituserpullrequests, totalpullrequests, '}');
        return [crituserpullrequests, totalpullrequests];
    }
    catch {
        logger_1.default.info('GH_API: getPullRequestData failed');
        return [-1, -1];
    }
}
exports.getPullRequestData = getPullRequestData;
/**
 * Gets the number of issues in a given state.
 *
 * @param repoUrl Gihub repository url
 * @param state State of the issue
 * @returns The number of issues in the state.
 */
async function getIssues(repoUrl, state) {
    logger_1.default.info('GH_API: running getIssues');
    const instance = axios_1.default.create({
        baseURL: 'https://api.github.com/repos/',
        timeout: 10000,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
    }); // create axios instance
    const repoOwner = repoUrl.split('/')[3];
    const repoName = repoUrl.split('/')[4];
    try {
        const response = await instance.get(`${repoOwner}/${repoName}/issues`, {
            params: { state, per_page: 100 }, // eslint-disable-line camelcase
        });
        logger_1.default.debug('GH_API: getIssues {', response.data.length, '}');
        return response.data.length;
    }
    catch {
        logger_1.default.info('GH_API: getIssues failed');
        return -1;
    }
}
exports.getIssues = getIssues;
/**
 * Gets the license of the repository.
 *
 * @param repoUrl Github repository url
 * @returns The license of the repository.
 */
async function getLicense(repoUrl) {
    logger_1.default.info('GH_API: running getLicense');
    const instance = axios_1.default.create({
        baseURL: 'https://api.github.com/repos',
        timeout: 10000,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
    }); // create axios instance
    const repoOwner = repoUrl.split('/')[3];
    const repoName = repoUrl.split('/')[4];
    try {
        const response = await instance.get(`${repoOwner}/${repoName}/license`);
        logger_1.default.debug('GH_API: getLicense {', response.data.license.key, '}');
        return response.data.license.key;
    }
    catch {
        logger_1.default.info('GH_API: getLicense failed');
        return '';
    }
}
exports.getLicense = getLicense;
/**
 * Gets the number of commits made in the past month.
 *
 * @param repoUrl  Github repository url
 * @returns The number of commits in the last 4 weeks
 */
async function getMonthlyCommitCount(repoUrl) {
    logger_1.default.info('GH_API: running getMonthlyCommitCount');
    const instance = axios_1.default.create({
        baseURL: 'https://api.github.com/repos',
        timeout: 10000,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
    }); // create axios instance
    const repoOwner = repoUrl.split('/')[3];
    const repoName = repoUrl.split('/')[4];
    try {
        const response = await instance.get(`${repoOwner}/${repoName}/stats/participation`);
        // get commit counts for each month of the year
        const months = response.data.all.length >= 52 ? 12 : response.data.all.length / 4;
        const count = [];
        const result = [];
        for (let i = 0; i < response.data.all.length; i += 1) {
            count[i] = response.data.all[i];
        }
        for (let i = 0; i < months; i += 1) {
            result[i] = 0;
        }
        for (let i = 0; i < response.data.all.length; i += 1) {
            result[Math.trunc(i / months)] += response.data.all[i];
        }
        logger_1.default.debug('GH_API: getMonthlyCommitCount {', result, '}');
        return result;
    }
    catch {
        logger_1.default.info('GH_API: getMonthlyCommitCount failed');
        return [-1];
    }
}
exports.getMonthlyCommitCount = getMonthlyCommitCount;
/**
 * Gets the number of commits made in the past year.
 *
 * @param repoUrl Github repository url
 * @returns The number of commits in the last year.
 */
async function getAnualCommitCount(repoUrl) {
    logger_1.default.info('GH_API: running getAnualCommitCount');
    const instance = axios_1.default.create({
        baseURL: 'https://api.github.com/repos',
        timeout: 10000,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
    }); // create axios instance
    const repoOwner = repoUrl.split('/')[3];
    const repoName = repoUrl.split('/')[4];
    try {
        const response = await instance.get(`${repoOwner}/${repoName}/stats/commit_activity`);
        let count = 0;
        for (let i = 0; i < response.data.length; i += 1) {
            count += response.data[i].total;
        }
        logger_1.default.debug('GH_API: getAnualCommitCount {', count, '}');
        return count;
    }
    catch {
        logger_1.default.info('GH_API: getAnualCommitCount failed');
        return -1;
    }
}
exports.getAnualCommitCount = getAnualCommitCount;
