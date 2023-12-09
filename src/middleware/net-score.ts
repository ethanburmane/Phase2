import {round} from './utils'
import {
  calculateBusFactor,
  calculateCorrectness,
  calculateRampUpTime,
  calculateResponsiveness,
  calculateLicenseCompliance,
  calculateDependency,
  calculateReviewPercentage,
} from './metric-calculations'
import logger from '../logger'

// NetScore sub-category Calculations
export async function calculateNetScore(url: string): Promise<Object> {
  logger.info('Calculating Net Score')

  const busFactor = await calculateBusFactor(url)
  const correctness = await calculateCorrectness(url)
  const rampUpTime = await calculateRampUpTime(url)
  const responsiveness = await calculateResponsiveness(url)
  const licenseCompliance = await calculateLicenseCompliance(url)
  const Dependencies = await calculateDependency(url)
  const reviewPercentage = await calculateReviewPercentage(url)
  console.log(`BusFactor: ${busFactor}`)
  console.log(`Correctness: ${correctness}`)
  console.log(`RampUpTime: ${rampUpTime}`)
  console.log(`Responsiveness: ${responsiveness}`)
  console.log(`LicenseCompliance: ${licenseCompliance}`)
  console.log(`Dependencies: ${Dependencies}`)
  console.log(`ReviewPercentage: ${reviewPercentage}`)


  /* eslint-disable no-template-curly-in-string */
  logger.debug(
    'busFactor: ${busFactor}, correctness: ${correctness}, rampUpTime: ${rampUpTime}, responsiveness: ${responsiveness}, licenseCompliance: ${licenseCompliance}',
  )
  /* eslint-enable no-template-curly-in-string */

  // Score weights
  const busFactorWeight = 0.2
  const correctnessWeight = 0.15
  const rampUpTimeWeight = 0.1
  const responsivenessWeight = 0.15
  const DependencyWeight = 0.1
  const reviewPercentageWeight = 0.15
  const licenseComplianceWeight = 0.15

  // Calculate net score with weightings
  const licenseScore = licenseCompliance * licenseComplianceWeight
  const busFactorScore = busFactor * busFactorWeight
  const correctnessScore = correctness * correctnessWeight
  const rampUpTimeScore = rampUpTime * rampUpTimeWeight
  const responsivenessScore = responsiveness * responsivenessWeight
  const DependencyScore = Dependencies * DependencyWeight
  const reviewPercentageScore = reviewPercentage * reviewPercentageWeight

  let netScore =
    (licenseScore + busFactorScore + correctnessScore + rampUpTimeScore
      + responsivenessScore + DependencyScore + reviewPercentageScore)

  netScore = round(netScore, 3)

  const score = {
    net: netScore,
    license: licenseScore,
    busFactor: busFactorScore,
    correctness: correctnessScore,
    rampUpTime: rampUpTimeScore,
    responsiveness: responsivenessScore,
    dependencies: DependencyScore,
    reviewPercentage: reviewPercentageScore
  }
  return score
}
