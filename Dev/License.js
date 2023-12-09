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
exports.CloneReadme = exports.FindMatch = void 0;
var axios_1 = require("axios");
var logger_1 = require("../src/logger");
var metric_calculations_1 = require("../src/middleware/metric-calculations");
var utils = require("../src/middleware/utils");
function FindMatch(fileContents) {
    var licensePatterns = [
        'LGPLv2[. ]1',
        'GPLv2',
        'GPLv3',
        'MIT',
        'BSD',
        'Apache',
        'Expat',
        'zlib',
        'ISC',
    ];
    // Create a set to store found licenses
    var foundLicenses = new Set();
    // Generate regex patterns for each license
    var regexPatterns = licensePatterns.map(function (pattern) {
        // Escape any special characters in the pattern
        var escapedPattern = pattern.replace(/[.*+?^${}()-|[\]\\]/g, '\\$&');
        return new RegExp("[^\\w\\d]".concat(escapedPattern, "[^\\w\\d]"), 'i');
    });
    // Find matches using the generated regex patterns
    for (var _i = 0, regexPatterns_1 = regexPatterns; _i < regexPatterns_1.length; _i++) {
        var regex = regexPatterns_1[_i];
        var matches = fileContents.match(regex);
        if (matches) {
            for (var _a = 0, matches_1 = matches; _a < matches_1.length; _a++) {
                var match = matches_1[_a];
                // Clean up the match by removing surrounding non-alphanumeric characters
                var cleanedMatch = match.replace(/[^a-zA-Z0-9]+/g, '');
                //console.log('Pattern Matched:', match);
                foundLicenses.add(cleanedMatch);
            }
        }
    }
    // Convert the set to an array and return it
    console.log(Array.from(foundLicenses));
    return Array.from(foundLicenses);
}
exports.FindMatch = FindMatch;
function CloneReadme(url) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, axios_1["default"].get(url, {
                            headers: {
                                Authorization: "token ".concat(process.env.GIT_TOKEN),
                                Accept: 'application/vnd.github.VERSION.raw'
                            }
                        })];
                case 1:
                    response = _a.sent();
                    // Return the README file content as a string.
                    return [2 /*return*/, response.data];
                case 2:
                    error_1 = _a.sent();
                    if (error_1.response) {
                        logger_1["default"].error("Error encountered when requesting readme", { timestamp: new Date(), url: url, message: error_1.message, response: error_1.response.data });
                        throw new Error(error_1.response.data);
                    }
                    else {
                        logger_1["default"].error("Error encountered when requesting readme", { timestamp: new Date(), url: url, message: error_1.message });
                        throw new Error(error_1.message);
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.CloneReadme = CloneReadme;
function calculateLicense(url) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var link, readme, licenses;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, utils.evaluateLink(url)];
                case 1:
                    link = _b.sent();
                    if (link) {
                        link = (_a = link === null || link === void 0 ? void 0 : link.split('github.com').pop()) !== null && _a !== void 0 ? _a : null;
                        link = 'https://github.com' + link; // eslint-disable-line prefer-template
                    }
                    console.log(link);
                    return [4 /*yield*/, CloneReadme(url)];
                case 2:
                    readme = _b.sent();
                    licenses = FindMatch(readme);
                    if (licenses.length > 0) {
                        console.log('true');
                        return [2 /*return*/, true];
                    }
                    else {
                        console.log('false');
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _b = (_a = console).log;
                    return [4 /*yield*/, (0, metric_calculations_1.calculateLicenseCompliance)('https://github.com/vuejs/vue')];
                case 1:
                    _b.apply(_a, [_c.sent()]);
                    return [4 /*yield*/, calculateLicense('https://www.npmjs.com/package/lodash')];
                case 2:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
}
main();
