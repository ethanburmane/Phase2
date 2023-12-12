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
  //set default values for metrics to -1
  let licenseCompliance = -1
  let busFactor = -1
  let correctness = -1
  let rampUpTime = -1
  let responsiveness = -1
  let Dependencies = -1
  let reviewPercentage = -1

  busFactor = await calculateBusFactor(url)
  correctness = await calculateCorrectness(url)
  //rampUpTime = await calculateRampUpTime(url)
  rampUpTime = 0.5
  responsiveness = await calculateResponsiveness(url)
  licenseCompliance = await calculateLicenseCompliance(url)
  Dependencies = await calculateDependency(url)
  reviewPercentage = await calculateReviewPercentage(url)
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
  const rampUpTimeWeight = 0.15
  const responsivenessWeight = 0.15
  const DependencyWeight = 0.15
  const reviewPercentageWeight = 0.2

  // Calculate net score with weightings
  const licenseScore = licenseCompliance
  const busFactorScore = busFactor * busFactorWeight
  const correctnessScore = correctness * correctnessWeight
  const rampUpTimeScore = rampUpTime * rampUpTimeWeight
  const responsivenessScore = responsiveness * responsivenessWeight
  const DependencyScore = Dependencies * DependencyWeight
  const reviewPercentageScore = reviewPercentage * reviewPercentageWeight

  let netScore =
    licenseCompliance * (busFactorScore + correctnessScore + rampUpTimeScore
      + responsivenessScore + DependencyScore + reviewPercentageScore)

  netScore = round(netScore, 3)
  const score = {
    net: netScore,
    license: licenseCompliance,
    busFactor: busFactor,
    correctness: correctness,
    rampUpTime: rampUpTime,
    responsiveness: responsiveness,
    dependencies: Dependencies,
    reviewPercentage: reviewPercentage
  }
  return score
}
