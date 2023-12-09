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
exports.isPinned = exports.evaluateLink = exports.calcRepoLines = exports.countLinesOfCode = exports.CloneReadme = exports.FindMatch = exports.cloneRepo = exports.parseGHRepoName = exports.getLinesOfCode = exports.identifyLink = exports.round = void 0;
/* eslint-disable no-console */
var fs = require("node:fs");
var url = require("node:url");
var node_child_process_1 = require("node:child_process");
var gh_service_1 = require("../services/gh-service");
var logger_1 = require("../logger");
var axios_1 = require("axios");
var path = require("path");
function round(value, decimals) {
    logger_1["default"].info("Rounding ".concat(value, " to ").concat(decimals, " decimal places"));
    // rounds number to specified decimal places
    return Number(value.toFixed(decimals));
}
exports.round = round;
function identifyLink(link) {
    logger_1["default"].info("Identifying link type for ".concat(link));
    // link pattern for github
    var githubPattern = /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+/;
    // link pattern for npm
    var npmPattern = /^(https?:\/\/)?(www\.)?npmjs\.com\/package\/[\w.-]+/;
    if (githubPattern.test(link)) {
        return 'github';
    }
    if (npmPattern.test(link)) {
        return 'npm';
    }
    return null;
}
exports.identifyLink = identifyLink;
function getLinesOfCode(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            logger_1["default"].info("Getting lines of code for ".concat(filePath));
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var lineCount = 0;
                    // open file stream
                    var stream = fs.createReadStream(filePath, { encoding: 'utf8' });
                    // count the lines of code in file stream
                    stream.on('data', function (chunk) {
                        // Use the corrected regular expression to match newlines
                        lineCount += (chunk.match(/(\r\n|\n|\r)/g) || []).length;
                    });
                    stream.on('end', function () {
                        resolve(lineCount + 1); // Add 1 to account for the last line without a newline character
                        logger_1["default"].debug("Lines of code: ".concat(lineCount));
                    });
                    stream.on('error', function (err) {
                        reject(err);
                    });
                })];
        });
    });
}
exports.getLinesOfCode = getLinesOfCode;
function parseGHRepoName(repoUrl) {
    logger_1["default"].info("Parsing GitHub repository name from ".concat(repoUrl));
    // Parse the URL
    var parsedUrl = url.parse(repoUrl);
    // Check if the URL is from github.com and has a valid path
    if (parsedUrl.hostname === 'github.com' &&
        parsedUrl.path &&
        parsedUrl.path.length > 1 // Ensure there's a path after the hostname
    ) {
        // Extract the repository name (removing leading slash if present)
        var pathComponents = parsedUrl.path.split('/');
        var repoName = pathComponents.pop(); // Get the last path component
        return repoName || null;
    }
    return null; // Not a valid GitHub repository URL
}
exports.parseGHRepoName = parseGHRepoName;
function cloneRepo(ghUrl, localPath, repoUrl) {
    logger_1["default"].info("Cloning GitHub repository from ".concat(ghUrl));
    // clone repo
    return new Promise(function (resolve, reject) {
        (0, node_child_process_1.exec)("git clone ".concat(repoUrl, " ").concat(localPath), function (error) {
            if (error) {
                logger_1["default"].error("Error cloning repo: ".concat(error));
                reject(error);
            }
            else {
                logger_1["default"].debug("Cloned repo to ".concat(localPath));
                resolve();
            }
        });
    });
}
exports.cloneRepo = cloneRepo;
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
        var escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Use word boundaries to ensure the pattern stands alone
        return new RegExp("\\b".concat(escapedPattern, "\\b"), 'i'); // 'i' for case insensitive
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
                    console.log(response.data);
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
function countLinesOfCode(dirPath) {
    var codeExtensions = new Set([
        '.js', '.py', '.java', '.cs', '.php',
        '.cpp', '.cc', '.cxx', '.h', '.hpp', '.hxx',
        '.ts', '.rb', '.swift', '.c',
        '.m', '.mm', '.scala', '.sh', '.bash',
        '.go', '.kt', '.kts', '.r', '.pl',
        '.rs', '.dart', '.lua', '.txt', '.env',
        '.config', '.xml', 'Makefile', '.md'
    ]);
    var ignoreDirs = new Set(['node_modules', 'data', 'vendor', 'build', 'test', 'tests', 'docs', 'assets']);
    logger_1["default"].info("Starting line count in directory: ".concat(dirPath));
    var lineCount = 0;
    var contents = fs.readdirSync(dirPath);
    contents.forEach(function (item) {
        var itemPath = path.join(dirPath, item);
        var itemStats = fs.statSync(itemPath);
        if (itemStats.isDirectory()) {
            // Check if the directory should be ignored
            if (!ignoreDirs.has(item)) {
                //console.log(`Traversing directory: ${itemPath}`);
                lineCount += countLinesOfCode(itemPath);
            }
        }
        else if (codeExtensions.has(path.extname(itemPath))) {
            try {
                var fileContent = fs.readFileSync(itemPath, 'utf-8');
                var fileLineCount = fileContent.split('\n').length;
                console.log("Counted ".concat(fileLineCount, " lines in file: ").concat(itemPath));
                lineCount += fileLineCount;
            }
            catch (error) {
                console.error("Error reading file ".concat(itemPath));
            }
        }
    });
    logger_1["default"].info("Completed line count in directory: ".concat(dirPath));
    return lineCount;
}
exports.countLinesOfCode = countLinesOfCode;
function calcRepoLines(repoPath, callback) {
    logger_1["default"].info("Calculating lines of code for ".concat(repoPath));
    var excludePatterns = [
        'node_modules',
        'dist',
        '.*\\.spec\\.ts', // Exclude TypeScript test files with .spec.ts extension
    ];
    // Construct the exclude arguments for cloc
    var excludeArgs = excludePatterns
        .map(function (pattern) { return "--exclude-dir=".concat(pattern); })
        .join(' ');
    // Define the cloc command with the exclude arguments
    var clocCommand = "cloc ".concat(repoPath, " ").concat(excludeArgs);
    var totalLines = 0;
    // Execute the cloc command
    (0, node_child_process_1.exec)(clocCommand, function (error, stdout, stderr) {
        if (error) {
            console.error("Error: ".concat(error.message));
            return;
        }
        if (stderr) {
            console.error("Error: ".concat(stderr));
            return;
        }
        var lines = stdout.split('\n');
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            if (line.startsWith('SUM:')) {
                var parts = line.trim().split(/\s+/);
                totalLines = Number.parseInt(parts.at(-1), 10);
                callback(totalLines);
                return;
            }
        }
    });
    return function () { return totalLines; };
}
exports.calcRepoLines = calcRepoLines;
function evaluateLink(link) {
    return __awaiter(this, void 0, void 0, function () {
        var linkType;
        return __generator(this, function (_a) {
            logger_1["default"].info("Evaluating link ".concat(link));
            linkType = identifyLink(link);
            if (linkType === 'github') {
                return [2 /*return*/, link];
            }
            if (linkType === 'npm') {
                return [2 /*return*/, (0, gh_service_1.getGithubLinkFromNpm)(link)];
            }
            return [2 /*return*/, null];
        });
    });
}
exports.evaluateLink = evaluateLink;
function isPinned(version) {
    // Regex for an exact version (major.minor.patch)
    var exactVersionRegex = /^\d+\.\d+\.\d+$/;
    // Regex for major.minor.x or major.minor.*
    var majorMinorWildcardRegex = /^\d+\.\d+\.(x|\*)$/;
    return exactVersionRegex.test(version) || majorMinorWildcardRegex.test(version);
}
exports.isPinned = isPinned;
