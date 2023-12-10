"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.fetchAllPullRequests = exports.checkIfPullRequestReviewed = exports.getDependencyList = exports.getAnualCommitCount = exports.getMonthlyCommitCount = exports.getLicense = exports.getIssues = exports.getPullRequestData = exports.getCommitData = void 0;
var dotenv = require("dotenv");
var axios_1 = require("axios");
var logger_1 = require("../logger");
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
function getCommitData(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var instance, repoOwner, repoName, response, login, contributions, totalContributions, i, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('GH_API: running getCommitData');
                    instance = axios_1["default"].create({
                        baseURL: 'https://api.github.com/repos/',
                        timeout: 10000,
                        headers: {
                            Accept: 'application/vnd.github+json',
                            Authorization: "Bearer ".concat(process.env.GITHUB_TOKEN)
                        }
                    }) // create axios instance
                    ;
                    repoOwner = repoUrl.split('/')[3];
                    repoName = repoUrl.split('/')[4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, instance.get("".concat(repoOwner, "/").concat(repoName, "/contributors"))];
                case 2:
                    response = _b.sent();
                    login = response.data[0].login;
                    contributions = response.data[0].contributions;
                    totalContributions = 0;
                    for (i = 0; i < response.data.length; i += 1) {
                        totalContributions += response.data[i].contributions;
                    }
                    logger_1["default"].debug('GH_API: getCommitData {', login, contributions, totalContributions, '}');
                    return [2 /*return*/, [login, contributions, totalContributions]];
                case 3:
                    _a = _b.sent();
                    logger_1["default"].info('GH_API: getCommitData failed');
                    return [2 /*return*/, ['', -1, -1]];
                case 4: return [2 /*return*/];
            }
        });
    });
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
function getPullRequestData(repoUrl, critUser) {
    return __awaiter(this, void 0, void 0, function () {
        var instance, repoOwner, repoName, response, crituserpullrequests, totalpullrequests, i, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('GH_API: running getPullRequestData');
                    instance = axios_1["default"].create({
                        baseURL: 'https://api.github.com/repos/',
                        timeout: 10000,
                        headers: {
                            Accept: 'application/vnd.github+json',
                            Authorization: "Bearer ".concat(process.env.GITHUB_TOKEN)
                        }
                    }) // create axios instance
                    ;
                    repoOwner = repoUrl.split('/')[3];
                    repoName = repoUrl.split('/')[4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, instance.get("".concat(repoOwner, "/").concat(repoName, "/search/pulls"), {
                            params: { state: 'all', per_page: 100 }
                        })];
                case 2:
                    response = _b.sent();
                    crituserpullrequests = 0;
                    totalpullrequests = response.data.length;
                    for (i = 0; i < totalpullrequests; i += 1) {
                        if (response.data[i].user.login === critUser) {
                            crituserpullrequests += 1;
                        }
                    }
                    logger_1["default"].debug('GH_API: getPullRequestData {', crituserpullrequests, totalpullrequests, '}');
                    return [2 /*return*/, [crituserpullrequests, totalpullrequests]];
                case 3:
                    _a = _b.sent();
                    logger_1["default"].info('GH_API: getPullRequestData failed');
                    return [2 /*return*/, [-1, -1]];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getPullRequestData = getPullRequestData;
/**
 * Gets the number of issues in a given state.
 *
 * @param repoUrl Gihub repository url
 * @param state State of the issue
 * @returns The number of issues in the state.
 */
function getIssues(repoUrl, state) {
    return __awaiter(this, void 0, void 0, function () {
        var instance, repoOwner, repoName, response, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('GH_API: running getIssues');
                    instance = axios_1["default"].create({
                        baseURL: 'https://api.github.com/repos/',
                        timeout: 10000,
                        headers: {
                            Accept: 'application/vnd.github+json',
                            Authorization: "Bearer ".concat(process.env.GITHUB_TOKEN)
                        }
                    }) // create axios instance
                    ;
                    repoOwner = repoUrl.split('/')[3];
                    repoName = repoUrl.split('/')[4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, instance.get("".concat(repoOwner, "/").concat(repoName, "/issues"), {
                            params: { state: state, per_page: 100 }
                        })];
                case 2:
                    response = _b.sent();
                    logger_1["default"].debug('GH_API: getIssues {', response.data.length, '}');
                    return [2 /*return*/, response.data.length];
                case 3:
                    _a = _b.sent();
                    logger_1["default"].info('GH_API: getIssues failed');
                    return [2 /*return*/, -1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getIssues = getIssues;
/**
 * Gets the license of the repository.
 *
 * @param repoUrl Github repository url
 * @returns The license of the repository.
 */
function getLicense(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var instance, repoOwner, repoName, response, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('GH_API: running getLicense');
                    instance = axios_1["default"].create({
                        baseURL: 'https://api.github.com/repos',
                        timeout: 10000,
                        headers: {
                            Accept: 'application/vnd.github+json',
                            Authorization: "Bearer ".concat(process.env.GITHUB_TOKEN)
                        }
                    }) // create axios instance
                    ;
                    repoOwner = repoUrl.split('/')[3];
                    repoName = repoUrl.split('/')[4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, instance.get("".concat(repoOwner, "/").concat(repoName, "/license"))];
                case 2:
                    response = _b.sent();
                    logger_1["default"].debug('GH_API: getLicense {', response.data.license.key, '}');
                    return [2 /*return*/, response.data.license.key];
                case 3:
                    _a = _b.sent();
                    logger_1["default"].info('GH_API: getLicense failed');
                    return [2 /*return*/, ''];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getLicense = getLicense;
/**
 * Gets the number of commits made in the past month.
 *
 * @param repoUrl  Github repository url
 * @returns The number of commits in the last 4 weeks
 */
function getMonthlyCommitCount(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var instance, repoOwner, repoName, response, months, count, result, i, i, i, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('GH_API: running getMonthlyCommitCount');
                    instance = axios_1["default"].create({
                        baseURL: 'https://api.github.com/repos',
                        timeout: 10000,
                        headers: {
                            Accept: 'application/vnd.github+json',
                            Authorization: "Bearer ".concat(process.env.GITHUB_TOKEN)
                        }
                    }) // create axios instance
                    ;
                    repoOwner = repoUrl.split('/')[3];
                    repoName = repoUrl.split('/')[4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, instance.get("".concat(repoOwner, "/").concat(repoName, "/stats/participation"))
                        // get commit counts for each month of the year
                    ];
                case 2:
                    response = _b.sent();
                    months = response.data.all.length >= 52 ? 12 : response.data.all.length / 4;
                    count = [];
                    result = [];
                    for (i = 0; i < response.data.all.length; i += 1) {
                        count[i] = response.data.all[i];
                    }
                    for (i = 0; i < months; i += 1) {
                        result[i] = 0;
                    }
                    for (i = 0; i < response.data.all.length; i += 1) {
                        result[Math.trunc(i / months)] += response.data.all[i];
                    }
                    logger_1["default"].debug('GH_API: getMonthlyCommitCount {', result, '}');
                    return [2 /*return*/, result];
                case 3:
                    _a = _b.sent();
                    logger_1["default"].info('GH_API: getMonthlyCommitCount failed');
                    return [2 /*return*/, [-1]];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getMonthlyCommitCount = getMonthlyCommitCount;
/**
 * Gets the number of commits made in the past year.
 *
 * @param repoUrl Github repository url
 * @returns The number of commits in the last year.
 */
function getAnualCommitCount(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var instance, repoOwner, repoName, response, count, i, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('GH_API: running getAnualCommitCount');
                    instance = axios_1["default"].create({
                        baseURL: 'https://api.github.com/repos',
                        timeout: 10000,
                        headers: {
                            Accept: 'application/vnd.github+json',
                            Authorization: "Bearer ".concat(process.env.GITHUB_TOKEN)
                        }
                    }) // create axios instance
                    ;
                    repoOwner = repoUrl.split('/')[3];
                    repoName = repoUrl.split('/')[4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, instance.get("".concat(repoOwner, "/").concat(repoName, "/stats/commit_activity"))];
                case 2:
                    response = _b.sent();
                    count = 0;
                    for (i = 0; i < response.data.length; i += 1) {
                        count += response.data[i].total;
                    }
                    logger_1["default"].debug('GH_API: getAnualCommitCount {', count, '}');
                    return [2 /*return*/, count];
                case 3:
                    _a = _b.sent();
                    logger_1["default"].info('GH_API: getAnualCommitCount failed');
                    return [2 /*return*/, -1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getAnualCommitCount = getAnualCommitCount;
function getDependencyList(repoUrl) {
    return __awaiter(this, void 0, void 0, function () {
        var instance, repoOwner, repoName, response, packageJson, dependencies, devDependencies, combinedDependencies, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    logger_1["default"].info('GH_API: running getAnualCommitCount');
                    instance = axios_1["default"].create({
                        baseURL: 'https://api.github.com/repos',
                        timeout: 10000,
                        headers: {
                            Accept: 'application/vnd.github+json',
                            Authorization: "Bearer ".concat(process.env.GITHUB_TOKEN)
                        }
                    });
                    repoOwner = repoUrl.split('/')[3];
                    repoName = repoUrl.split('/')[4];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, instance.get("".concat(repoOwner, "/").concat(repoName, "/contents/package.json"))];
                case 2:
                    response = _b.sent();
                    packageJson = JSON.parse(Buffer.from(response.data.content, 'base64').toString());
                    dependencies = packageJson.dependencies || {};
                    devDependencies = packageJson.devDependencies || {};
                    console.log('dependancies', dependencies);
                    combinedDependencies = __assign(__assign({}, dependencies), devDependencies);
                    return [2 /*return*/, combinedDependencies];
                case 3:
                    _a = _b.sent();
                    logger_1["default"].info('GH_API: getDepenencyList failed');
                    return [2 /*return*/, -1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.getDependencyList = getDependencyList;
function checkIfPullRequestReviewed(repoOwner, repoName, pullNumber) {
    return __awaiter(this, void 0, void 0, function () {
        var instance, reviewsResponse, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_1["default"].info('GH_API: running checkIfPullRequestReviewed');
                    instance = axios_1["default"].create({
                        baseURL: 'https://api.github.com/repos',
                        timeout: 10000,
                        headers: {
                            Accept: 'application/vnd.github+json',
                            Authorization: "Bearer ".concat(process.env.GITHUB_TOKEN)
                        }
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, instance.get("".concat(repoOwner, "/").concat(repoName, "/pulls/").concat(pullNumber, "/reviews"))];
                case 2:
                    reviewsResponse = _a.sent();
                    return [2 /*return*/, reviewsResponse.data.length > 0];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error checking reviews for pull request #".concat(pullNumber, ":"));
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.checkIfPullRequestReviewed = checkIfPullRequestReviewed;
function fetchAllPullRequests(repoOwner, repoName) {
    return __awaiter(this, void 0, void 0, function () {
        var instance, page, pullRequests, mergedPullRequests, hasNextPage, response, mergedPRs, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    instance = axios_1["default"].create({
                        baseURL: 'https://api.github.com/repos/',
                        timeout: 10000,
                        headers: {
                            Accept: 'application/vnd.github.v3+json',
                            Authorization: "Bearer ".concat(process.env.GITHUB_TOKEN)
                        }
                    });
                    page = 1;
                    pullRequests = [];
                    mergedPullRequests = [];
                    hasNextPage = true;
                    console.log("Starting to fetch pull requests for ".concat(repoOwner, "/").concat(repoName));
                    _a.label = 1;
                case 1:
                    if (!(hasNextPage && page <= 3)) return [3 /*break*/, 6];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, instance.get("".concat(repoOwner, "/").concat(repoName, "/pulls"), {
                            params: { state: 'all', per_page: 100, page: page }
                        })];
                case 3:
                    response = _a.sent();
                    console.log("Fetched page ".concat(page, " with ").concat(response.data.length, " pull requests."));
                    mergedPRs = response.data.filter(function (pr) { return pr.merged_at; });
                    mergedPullRequests = mergedPullRequests.concat(mergedPRs);
                    hasNextPage = response.data.length === 100;
                    page += 1;
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    console.error("Error fetching pull requests for page ".concat(page, ":"));
                    throw error_2;
                case 5: return [3 /*break*/, 1];
                case 6:
                    console.log("Finished fetching pull requests. Total count: ".concat(mergedPullRequests.length));
                    return [2 /*return*/, mergedPullRequests];
            }
        });
    });
}
exports.fetchAllPullRequests = fetchAllPullRequests;
