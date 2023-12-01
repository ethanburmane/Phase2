"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLicenseCompliance = exports.calculateResponsiveness = exports.calculateCorrectness = exports.calculateBusFactor = void 0;
const tslib_1 = require("tslib");
// funciton imports
const utils = tslib_1.__importStar(require("./utils"));
const gh_service_1 = require("../services/gh-service");
const logger_1 = tslib_1.__importDefault(require("../logger"));
// Bus Factor Calculations
async function calculateBusFactor(url) {
    var _a;
    logger_1.default.info('Calculating Bus Factor');
    // checks to see if link is a npm link and if so, converts it to a github link
    let link = await utils.evaluateLink(url);
    if (link) {
        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
        link = 'https://github.com' + link; // eslint-disable-line prefer-template
    }
    let data = null;
    // get data using ./services/gh-service.ts
    if (link) {
        data = await (0, gh_service_1.getBusFactorData)(link);
    }
    else {
        return 0;
    }
    // get data from returned object
    const { criticalContrubitorCommits, totalCommits, criticalContributorPullRequests, totalPullRequests, } = data;
    logger_1.default.debug(`criticalContrubitorCommits: ${criticalContrubitorCommits}, totalCommits: ${totalCommits}, criticalContributorPullRequests: ${criticalContributorPullRequests}, totalPullRequests: ${totalPullRequests}`);
    // variable weights
    const commitWeight = 0.4;
    const prWeight = 0.6;
    // calculate bus factor score
    const critBusFactor = criticalContrubitorCommits * commitWeight +
        criticalContributorPullRequests * prWeight;
    const totalBusFactor = totalCommits * commitWeight + totalPullRequests * prWeight;
    let busFactorScore = 1 - critBusFactor / totalBusFactor;
    // round to 3 decimal places
    busFactorScore = utils.round(busFactorScore, 3);
    return busFactorScore;
}
exports.calculateBusFactor = calculateBusFactor;
// Correctness Calculations
async function calculateCorrectness(url) {
    var _a;
    logger_1.default.info('Calculating Correctness');
    // checks to see if link is a npm link and if so, converts it to a github link
    let link = await utils.evaluateLink(url);
    if (link) {
        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
        link = 'https://github.com' + link; // eslint-disable-line prefer-template
    }
    let data = null;
    // get data using ./services/gh-service.ts
    if (link) {
        data = await (0, gh_service_1.getCorrectnessData)(link);
    }
    else {
        return 0;
    }
    // get data from returned object
    const { closedIssues, openIssues } = data;
    logger_1.default.debug(`closedIssues: ${closedIssues}, openIssues: ${openIssues}`);
    const totalIssues = closedIssues + openIssues;
    if (totalIssues === 0) {
        return 0;
    }
    // calculate correctness score
    let correctnessScore = closedIssues / totalIssues;
    // round to 3 decimal places
    correctnessScore = utils.round(correctnessScore, 3);
    return correctnessScore;
}
exports.calculateCorrectness = calculateCorrectness;
// // Ramp-up Time Calculations
// export async function calculateRampUpTime(url: string) {
//   logger.info('Calculating Ramp Up Time')
//   // checks to see if link is a npm link and if so, converts it to a github link
//   let link = await utils.evaluateLink(url)
//   if (link) {
//     link = link?.split('github.com').pop() ?? null
//     link = 'https://github.com' + link // eslint-disable-line prefer-template
//   }
//   let linesOfCode = 0
//   // get data using ./services/gh-service.ts
//   if (link) {
//     // clones the repo into ./cloned-repos
//     const repoName = utils.parseGHRepoName(link)
//     let localPath = '../ece461-project/src/middleware/cloned-repos'
//     // format local path name
//     if (repoName) {
//       localPath = path.join(localPath, repoName)
//     }
//     // add .git to end of url
//     let repoUrl = link
//     if (!link.includes('.git')) {
//       repoUrl = `${link}.git`
//     }
//     await utils.cloneRepo(link, localPath, repoUrl)
//     utils.calcRepoLines(localPath, (totalLines) => {
//       linesOfCode = totalLines
//       // console.log(totalLines)
//       logger.debug(`linesOfCode: ${linesOfCode}`)
//       let rampUpScore = 0
//       // console.log(linesOfCode)
//       if (linesOfCode <= 500) {
//         rampUpScore = 1
//       } else if (linesOfCode <= 1000) {
//         rampUpScore = 0.9
//       } else if (linesOfCode <= 5000) {
//         rampUpScore = 0.8
//       } else if (linesOfCode <= 10_000) {
//         rampUpScore = 0.7
//       } else if (linesOfCode <= 50_000) {
//         rampUpScore = 0.6
//       } else if (linesOfCode <= 100_000) {
//         rampUpScore = 0.5
//       } else if (linesOfCode <= 500_000) {
//         rampUpScore = 0.4
//       } else if (linesOfCode <= 1_000_000) {
//         rampUpScore = 0.3
//       } else if (linesOfCode <= 5_000_000) {
//         rampUpScore = 0.2
//       }
//       return rampUpScore
//     })
//   } else {
//     return () => 0
//   }
// }
// Responsiveness Calculations
async function calculateResponsiveness(url) {
    var _a;
    logger_1.default.info('Calculating Responsiveness');
    // checks to see if link is a npm link and if so, converts it to a github link
    let link = await utils.evaluateLink(url);
    if (link) {
        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
        link = 'https://github.com' + link; // eslint-disable-line prefer-template
    }
    let data = null;
    // get data using ./services/gh-service.ts
    if (link) {
        data = await (0, gh_service_1.getResponsivenessData)(link);
    }
    else {
        return 0;
    }
    const { monthlyCommitCount, annualCommitCount } = data;
    // calculate difference between the max and min monthly commits
    const maxMonthlyCommitCount = Math.max(...monthlyCommitCount);
    const minMonthlyCommitCount = Math.min(...monthlyCommitCount);
    const diffCommit = maxMonthlyCommitCount - minMonthlyCommitCount;
    logger_1.default.debug(`maxMonthlyCommitCount: ${maxMonthlyCommitCount}, minMonthlyCommitCount: ${minMonthlyCommitCount}, diffCommit: ${diffCommit}`);
    /* eslint-disable no-implicit-coercion */
    /* eslint-disable no-else-return */
    // assign score based oon difference between max and min monthly commits
    if (diffCommit < annualCommitCount * 0.1) {
        return 1;
    }
    else if (diffCommit < annualCommitCount * 0.2) {
        return 0.9;
    }
    else if (diffCommit < annualCommitCount * 0.3) {
        return 0.8;
    }
    else if (diffCommit < annualCommitCount * 0.4) {
        return 0.7;
    }
    else if (diffCommit < annualCommitCount * 0.5) {
        return 0.6;
    }
    else if (diffCommit < annualCommitCount * 0.6) {
        return 0.5;
    }
    else if (diffCommit < annualCommitCount * 0.7) {
        return 0.4;
    }
    else if (diffCommit < annualCommitCount * 0.8) {
        return 0.3;
    }
    else if (diffCommit < annualCommitCount * 0.9) {
        return 0.2;
    }
    else if (diffCommit < annualCommitCount * 1) {
        return 0.1;
    }
    else {
        return 0;
    }
    /* eslint-enable no-else-return */
    /* eslint-enable no-implicit-coercion */
}
exports.calculateResponsiveness = calculateResponsiveness;
// License Compliance Calculations
async function calculateLicenseCompliance(url) {
    var _a;
    logger_1.default.info('Calculating License Compliance');
    // checks to see if link is a npm link and if so, converts it to a github link
    let link = await utils.evaluateLink(url);
    if (link) {
        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
        link = 'https://github.com' + link; // eslint-disable-line prefer-template
    }
    let licenseCompliantScore = 0;
    // get data using ./services/gh-service.ts
    if (link) {
        licenseCompliantScore = await (0, gh_service_1.getLiscenseComplianceData)(link);
        logger_1.default.debug(`licenseCompliantScore: ${licenseCompliantScore}`);
    }
    else {
        return 0;
    }
    return licenseCompliantScore;
}
exports.calculateLicenseCompliance = calculateLicenseCompliance;
