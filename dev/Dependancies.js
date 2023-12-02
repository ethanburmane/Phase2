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
var axios_1 = require("axios");
function isPinned(version) {
    // Regex for an exact version (major.minor.patch)
    var exactVersionRegex = /^\d+\.\d+\.\d+$/;
    // Regex for major.minor.x or major.minor.*
    var majorMinorWildcardRegex = /^\d+\.\d+\.(x|\*)$/;
    return exactVersionRegex.test(version) || majorMinorWildcardRegex.test(version);
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var GITHUB_TOKEN, Django, instance, repoOwner, repoName, response, packageJson, dependencies, devDependencies, combinedDependencies, dev, d1, numPin, key, pinned, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    GITHUB_TOKEN = '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';
                    console.log(GITHUB_TOKEN);
                    Django = 'https://github.com/django/django';
                    console.log(Django);
                    instance = axios_1["default"].create({
                        baseURL: 'https://api.github.com/repos/',
                        timeout: 10000,
                        headers: {
                            Accept: 'application/vnd.github+json',
                            Authorization: "Bearer ".concat(GITHUB_TOKEN)
                        }
                    });
                    repoOwner = Django.split('/')[3];
                    repoName = Django.split('/')[4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, instance.get("".concat(repoOwner, "/").concat(repoName, "/contents/package.json"))];
                case 2:
                    response = _a.sent();
                    packageJson = JSON.parse(Buffer.from(response.data.content, 'base64').toString());
                    dependencies = packageJson.dependencies || {};
                    devDependencies = packageJson.devDependencies || {};
                    console.log('dependancies', dependencies);
                    combinedDependencies = __assign(__assign({}, dependencies), devDependencies);
                    dev = Object.entries(combinedDependencies);
                    console.log('dev', devDependencies);
                    console.log('d0', dev[0][1]);
                    console.log('d1', dev[1]);
                    d1 = dev[0];
                    console.log(isPinned("~1.2.3"));
                    console.log(isPinned("1.2.3")); // true (exact version)
                    console.log(isPinned("1.2.x")); // true (major and minor pinned, any patch)
                    console.log(isPinned("1.2.*"));
                    console.log(isPinned("^8.52.0")); // false (missing patch)
                    numPin = 0;
                    for (key in dev) {
                        pinned = isPinned(dev[key]);
                        console.log("Dependency: ".concat(key, ", Version: ").concat(dev[key]));
                        console.log(isPinned(dev[key]));
                        if (pinned) { // Check if the property is a direct property of the object
                            numPin += 1;
                        }
                    }
                    console.log('numPin', numPin);
                    console.log('length', dev.length);
                    if (numPin === 0) {
                        return [2 /*return*/, 1.0];
                    }
                    else {
                        return [2 /*return*/, numPin / dev.length];
                    }
                    return [2 /*return*/, Object.entries(combinedDependencies).map(function (_a) {
                            var name = _a[0], version = _a[1];
                            return ({ name: name, version: version });
                        })];
                case 3:
                    error_1 = _a.sent();
                    //logger.error('GH_API: getDependencies failed', error);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
}
main();
