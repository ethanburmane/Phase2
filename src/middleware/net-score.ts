import {round} from './utils'
import {
  calculateBusFactor,
  calculateCorrectness,
  // calculateRampUpTime,
  calculateResponsiveness,
  calculateLicenseCompliance,
  calculateReviewPercentage,
} from './metric-calculations'
import logger from '../logger'

// NetScore sub-category Calculations
export async function calculateNetScore(url: string): Promise<number> {
  logger.info('Calculating Net Score')

  const busFactor = await calculateBusFactor(url)
  const correctness = await calculateCorrectness(url)
  // const rampUpTime = await calculateRampUpTime(url)
  const responsiveness = await calculateResponsiveness(url)
  const licenseCompliance = await calculateLicenseCompliance(url)
  const reviewPercentage = await calculateReviewPercentage(url)

  /* eslint-disable no-template-curly-in-string */
  logger.debug(
   " `busFactor: ${busFactor}, correctness: ${correctness}, rampUpTime: ${rampUpTime}, responsiveness: ${responsiveness}, licenseCompliance: ${licenseCompliance}`",
  )
  /* eslint-enable no-template-curly-in-string */

  // Score weights
  const busFactorWeight = 0.25
  const correctnessWeight = 0.15
  // const rampUpTimeWeight = 0.15
  const responsivenessWeight = 0.3
  const ReviewPercentageWeight = 0.15

  // Calculate net score with weightings
  let netScore =
    licenseCompliance *
    (busFactor * busFactorWeight +
     correctness * correctnessWeight +
     // rampUpTime * rampUpTimeWeight +
     responsiveness * responsivenessWeight + 
     reviewPercentage * ReviewPercentageWeight)

  netScore = round(netScore, 3)

  return netScore
}
