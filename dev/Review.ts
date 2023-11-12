//import * as utils from '../src/middleware/utils'
import {
  getBusFactorData,
  getCorrectnessData,
  getResponsivenessData,
  getLiscenseComplianceData,
  getReviewData,
} from '../src/services/gh-service'
//import logger from '../src/services/logger'

import { calculateReviewPercentage } from '../src/middleware/metric-calculations'

const testDjango = calculateReviewPercentage('https://github.com/django/django')
//print(testDjango)
console.log(testDjango)
