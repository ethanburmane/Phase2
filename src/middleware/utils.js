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
exports.evaluateLink = exports.calcRepoLines = exports.cloneRepo = exports.parseGHRepoName = exports.getLinesOfCode = exports.identifyLink = exports.round = void 0;
/* eslint-disable no-console */
var fs = require("node:fs");
var url = require("node:url");
var node_child_process_1 = require("node:child_process");
var gh_service_1 = require("../services/gh-service");
var logger_1 = require("../logger");
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
