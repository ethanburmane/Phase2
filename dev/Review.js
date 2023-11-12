"use strict";
exports.__esModule = true;
//import logger from '../src/services/logger'
var metric_calculations_1 = require("../src/middleware/metric-calculations");
var testDjango = (0, metric_calculations_1.calculateReviewPercentage)('https://github.com/django/django');
//print(testDjango)
console.log(testDjango);
