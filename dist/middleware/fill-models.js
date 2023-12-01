"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignMetrics = void 0;
const metric_calculations_1 = require("./metric-calculations");
const net_score_1 = require("./net-score");
const url_models_1 = require("../models/url-models");
// using imported class and functions to get scores and send to frontend
async function assignMetrics(data) {
    const newURL = new url_models_1.Urlmetrics(data);
    newURL.BusFactor = await (0, metric_calculations_1.calculateBusFactor)(newURL.URL);
    newURL.Correctness = await (0, metric_calculations_1.calculateCorrectness)(newURL.URL);
    newURL.RampUp = /* await calculateRampUpTime(newURL.URL) */ -1;
    newURL.Responsiveness = await (0, metric_calculations_1.calculateResponsiveness)(newURL.URL);
    newURL.License = await (0, metric_calculations_1.calculateLicenseCompliance)(newURL.URL);
    newURL.NetScore = await (0, net_score_1.calculateNetScore)(newURL.URL);
    return newURL;
}
exports.assignMetrics = assignMetrics;
