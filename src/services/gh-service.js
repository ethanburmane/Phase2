"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getGithubLinkFromNpm = exports.getResponsivenessData = exports.getLiscenseComplianceData = exports.getCorrectnessData = exports.getBusFactorData = exports.getReviewData = void 0;
var axios_1 = require("axios");
var ghApi = require("./gh-api");
var logger_1 = require("../logger");
/**
 * Gets the data required to calculate the reviewed code percentage.
 *
 * @param repoUrl Github repository url.
 * @returns The data required to calculate the bus factor.
 */
function getReviewData(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, criticalUserLogin, criticalContrubitorCommits, totalCommits, _b, crituserPulls, reviewedPulls, totalPulls;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    logger_1["default"].info('GH_SERVICE: running getReviewData');
                    return [4 /*yield*/, ghApi.getCommitData(repoUrl)];
                case 1:
                    _a = _c.sent(), criticalUserLogin = _a[0], criticalContrubitorCommits = _a[1], totalCommits = _a[2];
                    return [4 /*yield*/, ghApi.getPullRequestData(repoUrl, criticalUserLogin)
                        //print type of reviewedPulls
                    ];
                case 2:
                    _b = _c.sent(), crituserPulls = _b[0], reviewedPulls = _b[1], totalPulls = _b[2];
                    //print type of reviewedPulls
                    console.log(typeof reviewedPulls);
                    return [2 /*return*/, {
                            numReviewedPullRequests: reviewedPulls,
                            numPullRequests: totalPulls
                        }];
            }
        });
    });
}
exports.getReviewData = getReviewData;
/**
 * Gets the data required to calculate the bus factor.
 *
 * @param repoUrl Github repository url.
 * @returns The data required to calculate the bus factor.
 */
function getBusFactorData(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, criticalUserLogin, criticalContrubitorCommits, totalCommits, _b, criticalContributorPullRequests, reviewedpullrequests, totalPullRequests;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    logger_1["default"].info('GH_SERVICE: running getBusFactorData');
                    return [4 /*yield*/, ghApi.getCommitData(repoUrl)];
                case 1:
                    _a = _c.sent(), criticalUserLogin = _a[0], criticalContrubitorCommits = _a[1], totalCommits = _a[2];
                    return [4 /*yield*/, ghApi.getPullRequestData(repoUrl, criticalUserLogin)];
                case 2:
                    _b = _c.sent(), criticalContributorPullRequests = _b[0], reviewedpullrequests = _b[1], totalPullRequests = _b[2];
                    return [2 /*return*/, {
                            criticalContrubitorCommits: criticalContrubitorCommits,
                            totalCommits: totalCommits,
                            criticalContributorPullRequests: criticalContributorPullRequests,
                            totalPullRequests: totalPullRequests
                        }];
            }
        });
    });
}
exports.getBusFactorData = getBusFactorData;
/**
 * Gets the data required to calculate the correctness.
 *
 * @param repoUrl Github repository url
 * @returns The data required to calculate the correctness.
 */
function getCorrectnessData(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var closedIssues, openIssues;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_1["default"].info('GH_SERVICE: running getCorrectnessData');
                    return [4 /*yield*/, ghApi.getIssues(repoUrl, 'closed')];
                case 1:
                    closedIssues = _a.sent();
                    return [4 /*yield*/, ghApi.getIssues(repoUrl, 'open')];
                case 2:
                    openIssues = _a.sent();
                    return [2 /*return*/, {
                            closedIssues: closedIssues,
                            openIssues: openIssues
                        }];
            }
        });
    });
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
function getLiscenseComplianceData(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var liscense;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_1["default"].info('GH_SERVICE: running getLiscenseComplianceData');
                    return [4 /*yield*/, ghApi.getLicense(repoUrl)];
                case 1:
                    liscense = _a.sent();
                    return [2 /*return*/, liscense === 'lpgl-2.1' ? 1 : 0];
            }
        });
    });
}
exports.getLiscenseComplianceData = getLiscenseComplianceData;
/**
 * Gets the data required to calculate the responsiveness.
 *
 * @param repoUrl Github repository url
 * @returns The data required to calculate the responsiveness.
 */
function getResponsivenessData(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var monthlyCommitCount, annualCommitCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_1["default"].info('GH_SERVICE: running getResponsivenessData');
                    return [4 /*yield*/, ghApi.getMonthlyCommitCount(repoUrl)];
                case 1:
                    monthlyCommitCount = _a.sent();
                    return [4 /*yield*/, ghApi.getAnualCommitCount(repoUrl)];
                case 2:
                    annualCommitCount = _a.sent();
                    return [2 /*return*/, {
                            monthlyCommitCount: monthlyCommitCount,
                            annualCommitCount: annualCommitCount
                        }];
            }
        });
    });
}
exports.getResponsivenessData = getResponsivenessData;
/**
 * Converts a NPM link into a Github repository url.
 *
 * @param npmUrl Link to npm package
 * @returns Github repository url
 */
function getGithubLinkFromNpm(npmUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var instance, npmName, response, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('GH_SERVICE: running getGithubLinkFromNpm');
                    instance = axios_1["default"].create({
                        baseURL: 'https://registry.npmjs.org/',
                        timeout: 10000,
                        headers: {
                            Accept: 'application/vnd.github+json',
                            Authorization: "Bearer ".concat(process.env.GITHUB_TOKEN)
                        }
                    }) // create axios instance
                    ;
                    npmName = npmUrl.split('/')[4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, instance.get("".concat(npmName))];
                case 2:
                    response = _b.sent();
                    return [2 /*return*/, response.data.repository.url];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, 'error'];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getGithubLinkFromNpm = getGithubLinkFromNpm;
