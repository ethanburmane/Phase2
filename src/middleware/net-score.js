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
exports.calculateNetScore = void 0;
var utils_1 = require("./utils");
var metric_calculations_1 = require("./metric-calculations");
var logger_1 = require("../logger");
// NetScore sub-category Calculations
function calculateNetScore(url) {
    return __awaiter(this, void 0, void 0, function () {
        var licenseCompliance, busFactor, correctness, rampUpTime, responsiveness, Dependencies, reviewPercentage, busFactorWeight, correctnessWeight, rampUpTimeWeight, responsivenessWeight, DependencyWeight, reviewPercentageWeight, licenseComplianceWeight, licenseScore, busFactorScore, correctnessScore, rampUpTimeScore, responsivenessScore, DependencyScore, reviewPercentageScore, netScore, score;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logger_1["default"].info('Calculating Net Score');
                    licenseCompliance = -1;
                    busFactor = -1;
                    correctness = -1;
                    rampUpTime = -1;
                    responsiveness = -1;
                    Dependencies = -1;
                    reviewPercentage = -1;
                    return [4 /*yield*/, (0, metric_calculations_1.calculateBusFactor)(url)];
                case 1:
                    busFactor = _a.sent();
                    return [4 /*yield*/, (0, metric_calculations_1.calculateCorrectness)(url)
                        // rampUpTime = await calculateRampUpTime(url)
                    ];
                case 2:
                    correctness = _a.sent();
                    return [4 /*yield*/, (0, metric_calculations_1.calculateResponsiveness)(url)];
                case 3:
                    // rampUpTime = await calculateRampUpTime(url)
                    responsiveness = _a.sent();
                    return [4 /*yield*/, (0, metric_calculations_1.calculateLicenseCompliance)(url)];
                case 4:
                    licenseCompliance = _a.sent();
                    return [4 /*yield*/, (0, metric_calculations_1.calculateDependency)(url)];
                case 5:
                    Dependencies = _a.sent();
                    return [4 /*yield*/, (0, metric_calculations_1.calculateReviewPercentage)(url)];
                case 6:
                    reviewPercentage = _a.sent();
                    console.log("BusFactor: ".concat(busFactor));
                    console.log("Correctness: ".concat(correctness));
                    //console.log(`RampUpTime: ${rampUpTime}`)
                    console.log("Responsiveness: ".concat(responsiveness));
                    console.log("LicenseCompliance: ".concat(licenseCompliance));
                    console.log("Dependencies: ".concat(Dependencies));
                    console.log("ReviewPercentage: ".concat(reviewPercentage));
                    /* eslint-disable no-template-curly-in-string */
                    logger_1["default"].debug('busFactor: ${busFactor}, correctness: ${correctness}, rampUpTime: ${rampUpTime}, responsiveness: ${responsiveness}, licenseCompliance: ${licenseCompliance}');
                    busFactorWeight = 0.2;
                    correctnessWeight = 0.15;
                    rampUpTimeWeight = 0.1;
                    responsivenessWeight = 0.15;
                    DependencyWeight = 0.1;
                    reviewPercentageWeight = 0.15;
                    licenseComplianceWeight = 0.15;
                    licenseScore = licenseCompliance * licenseComplianceWeight;
                    busFactorScore = busFactor * busFactorWeight;
                    correctnessScore = correctness * correctnessWeight;
                    rampUpTimeScore = rampUpTime * rampUpTimeWeight;
                    responsivenessScore = responsiveness * responsivenessWeight;
                    DependencyScore = Dependencies * DependencyWeight;
                    reviewPercentageScore = reviewPercentage * reviewPercentageWeight;
                    netScore = (licenseScore + busFactorScore + correctnessScore + rampUpTimeScore
                        + responsivenessScore + DependencyScore + reviewPercentageScore);
                    netScore = (0, utils_1.round)(netScore, 3);
                    score = {
                        net: netScore,
                        license: licenseScore,
                        busFactor: busFactorScore,
                        correctness: correctnessScore,
                        rampUpTime: rampUpTimeScore,
                        responsiveness: responsivenessScore,
                        dependencies: DependencyScore,
                        reviewPercentage: reviewPercentageScore
                    };
                    return [2 /*return*/, score];
            }
        });
    });
}
exports.calculateNetScore = calculateNetScore;
